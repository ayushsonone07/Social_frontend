import { LoginCredentials, RegisterData, AuthTokens, User } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend2-seven-sigma.vercel.app/api/v1"

class ApiClient {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private isRefreshing = false
  private refreshSubscribers: ((token: string) => void)[] = []

  constructor() {
    this.loadTokensFromStorage()
  }

  private loadTokensFromStorage() {
    if (typeof window !== "undefined") {
      this.accessToken = localStorage.getItem("access_token")
      this.refreshToken = localStorage.getItem("refresh_token")
    }
  }

  private saveTokens(tokens: AuthTokens) {
    this.accessToken = tokens.access_token
    this.refreshToken = tokens.refresh_token || null
    
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", tokens.access_token)
      if (tokens.refresh_token) {
        localStorage.setItem("refresh_token", tokens.refresh_token)
      }
    }
  }

  private clearTokens() {
    this.accessToken = null
    this.refreshToken = null
    
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("user")
    }
  }

  private subscribeToTokenRefresh(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback)
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token))
    this.refreshSubscribers = []
  }

  async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing) {
      return new Promise(resolve => {
        this.subscribeToTokenRefresh(token => resolve(token))
      })
    }

    this.isRefreshing = true

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ refresh_token: this.refreshToken })
      })

      if (!res.ok) {
        this.clearTokens()
        this.isRefreshing = false
        return null
      }

      const tokens: AuthTokens = await res.json()
      this.saveTokens(tokens)
      this.isRefreshing = false
      this.onTokenRefreshed(tokens.access_token)
      return tokens.access_token
    } catch {
      this.clearTokens()
      this.isRefreshing = false
      return null
    }
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    }
    
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`
    }
    
    return headers
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "An error occurred" }))
      
      if (res.status === 401) {
        throw new Error("UNAUTHORIZED")
      }
      
      if (res.status === 403) {
        throw new Error("FORBIDDEN")
      }
      
      throw new Error(error.message || `HTTP ${res.status}`)
    }
    
    return res.json()
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOnUnauthorized = true
  ): Promise<T> {
    const url = `${API_URL}${endpoint}`
    
    const res = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    })

    if (res.status === 401 && retryOnUnauthorized && this.refreshToken) {
      const newToken = await this.refreshAccessToken()
      
      if (newToken) {
        return this.request<T>(endpoint, options, false)
      }
      
      window.location.href = "/login"
      throw new Error("Session expired")
    }

    return this.handleResponse<T>(res)
  }

  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    })

    const data = await this.handleResponse<{ access_token: string; user: { id: number; email: string } }>(res)
    
    this.saveTokens({
      access_token: data.access_token
    })

    const user: User = {
      id: data.user.id,
      email: data.user.email,
      username: ""
    }

    return {
      user,
      tokens: {
        access_token: data.access_token
      }
    }
  }

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })

    const response = await this.handleResponse<{ id: number; username: string; email: string }>(res)
    
    const user: User = {
      id: response.id,
      username: response.username,
      email: response.email
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
    }

    return {
      user,
      tokens: {
        access_token: ""
      }
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await this.request<User>("/auth/me", { method: "GET" })
      return user
    } catch {
      return null
    }
  }

  async getUserById(userId: number): Promise<User | null> {
    try {
      const user = await this.request<{ id: number; username: string; email: string }>(`/users/${userId}`, { method: "GET" })
      return {
        id: user.id,
        username: user.username,
        email: user.email
      }
    } catch {
      return null
    }
  }

  logout() {
    this.clearTokens()
  }

  getAccessToken(): string | null {
    return this.accessToken
  }
}

export const apiClient = new ApiClient()
