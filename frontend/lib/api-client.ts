import { LoginCredentials, RegisterData, AuthTokens, User } from "./types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-zeta-one-77.vercel.app/api/v1"

export interface Post {
  id: number
  content: string
  user_id: number
  created_at: string
  user?: {
    id: number
    username: string
  }
  likes_count?: number
  comments_count?: number
  is_liked?: boolean
}

export interface Comment {
  id: number
  content: string
  user_id: number
  post_id: number
  created_at: string
  user?: {
    id: number
    username: string
  }
}

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

  private getAuthHeaders(): HeadersInit {
    if (!this.accessToken) {
      this.loadTokensFromStorage()
    }
    
    const headers: HeadersInit = {
      "Content-Type": "application/json"
    }
    
    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`
    }
    
    return headers
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

    if (!this.refreshToken) {
      return null
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
      
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
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

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Login failed" }))
      throw new Error(error.message || error.detail || "Login failed")
    }

    const data = await res.json()
    
    const tokens: AuthTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type
    }
    
    this.saveTokens(tokens)

    const user: User = {
      id: data.user?.id,
      email: data.user?.email,
      username: data.user?.username || ""
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
    }

    return { user, tokens }
  }

  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Registration failed" }))
      throw new Error(error.message || error.detail || "Registration failed")
    }

    const response = await res.json()
    
    const user: User = {
      id: response.id || response.user?.id,
      username: response.username || response.user?.username || "",
      email: response.email || response.user?.email || ""
    }

    const tokens: AuthTokens = {
      access_token: response.access_token || "",
      refresh_token: response.refresh_token
    }
    
    if (response.access_token) {
      this.saveTokens(tokens)
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
    }

    return { user, tokens }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await this.request<{ id: number; username: string; email: string }>("/auth/me", { method: "GET" })
      return {
        id: user.id,
        username: user.username,
        email: user.email
      }
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

  async logout(): Promise<void> {
    try {
      await this.request("/auth/logout", { method: "POST" })
    } catch {
    }
    this.clearTokens()
  }

  async getPosts(): Promise<Post[]> {
    try {
      return await this.request<Post[]>("/posts", { method: "GET" })
    } catch {
      return []
    }
  }

  async createPost(content: string): Promise<Post> {
    return await this.request<Post>("/posts", {
      method: "POST",
      body: JSON.stringify({ content })
    })
  }

  async likePost(postId: number): Promise<void> {
    await this.request(`/posts/${postId}/like/`, { method: "POST" })
  }

  async createComment(postId: number, content: string): Promise<Comment> {
    return await this.request<Comment>("/comments", {
      method: "POST",
      body: JSON.stringify({ post_id: postId, content })
    })
  }

  getAccessToken(): string | null {
    return this.accessToken
  }
}

export const apiClient = new ApiClient()
