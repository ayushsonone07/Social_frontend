export interface User {
  id: number
  username: string
  email: string
}

export interface AuthTokens {
  access_token: string
  refresh_token?: string
  token_type?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export interface ApiError {
  message: string
  status?: number
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | null
}
