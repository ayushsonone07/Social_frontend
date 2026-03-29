"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getMe } from "../services/authservice"

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (token) {
      getMe().then(setUser).catch(() => {
        localStorage.removeItem("token")
      })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)