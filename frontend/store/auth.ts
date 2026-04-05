import { create } from "zustand"
import { persist } from "zustand/middleware"
import { apiClient } from "@/lib/api-client"
import { User, LoginCredentials, RegisterData } from "@/lib/types"

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
  fetchUser: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const { user: partialUser, tokens } = await apiClient.login(credentials)
          
          const fullUser = await apiClient.getUserById(partialUser.id)
          
          if (!fullUser) {
            throw new Error("Failed to fetch user profile")
          }

          if (typeof window !== "undefined") {
            const cookieString = `access_token=${tokens.access_token}; path=/; SameSite=Lax`
            if (tokens.refresh_token) {
              document.cookie = `refresh_token=${tokens.refresh_token}; path=/; SameSite=Lax`
            }
            document.cookie = cookieString
            localStorage.setItem("user", JSON.stringify(fullUser))
          }
          
          set({
            user: fullUser,
            isAuthenticated: true,
            isLoading: false
          })
          
          return true
        } catch (error) {
          const message = error instanceof Error ? error.message : "Login failed"
          set({ error: message, isLoading: false })
          return false
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null })
        
        try {
          const { user: partialUser } = await apiClient.register(data)
          
          const fullUser = await apiClient.getUserById(partialUser.id)
          
          if (!fullUser) {
            throw new Error("Failed to fetch user profile")
          }
          
          set({
            user: fullUser,
            isAuthenticated: true,
            isLoading: false
          })

          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(fullUser))
          }
          
          return true
        } catch (error) {
          const message = error instanceof Error ? error.message : "Registration failed"
          set({ error: message, isLoading: false })
          return false
        }
      },

      logout: () => {
        apiClient.logout()
        
        if (typeof window !== "undefined") {
          document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
          document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        }
        
        set({
          user: null,
          isAuthenticated: false,
          error: null
        })

        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      },

      fetchUser: async () => {
        set({ isLoading: true })
        
        try {
          const storedUser = localStorage.getItem("user")
          if (!storedUser) {
            set({ user: null, isAuthenticated: false, isLoading: false })
            return
          }
          
          const parsedUser = JSON.parse(storedUser)
          if (!parsedUser.id) {
            set({ user: null, isAuthenticated: false, isLoading: false })
            return
          }
          
          const user = await apiClient.getUserById(parsedUser.id)
          
          if (user) {
            set({ user, isAuthenticated: true, isLoading: false })
            localStorage.setItem("user", JSON.stringify(user))
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false })
          }
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
