"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchUser, isAuthenticated } = useAuthStore()

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem("access_token")
      
      if (accessToken && !isAuthenticated) {
        await fetchUser()
      }
    }

    initAuth()
  }, [fetchUser, isAuthenticated])

  return <>{children}</>
}
