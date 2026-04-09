"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore(state => state.fetchUser)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const initAuth = async () => {
      const cookies = document.cookie
      const hasAccessToken = cookies.includes("access_token=") || cookies.includes("refresh_token=")
      const hasLocalToken = localStorage.getItem("access_token")
      const currentState = useAuthStore.getState()
      
      if ((hasAccessToken || hasLocalToken) && !currentState.isAuthenticated) {
        await fetchUser()
      }
    }

    initAuth()
  }, [mounted, fetchUser])

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return <>{children}</>
}
