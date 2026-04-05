"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth"

interface UserProfile {
  id: number
  username: string
  email: string
}

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuthStore()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!params.userId) {
      setLoading(false)
      return
    }

    async function loadProfile() {
      try {
        const userIdParam = params.userId as string
        
        const id = parseInt(userIdParam, 10)
        if (isNaN(id)) {
          setError("Invalid user ID format")
          setLoading(false)
          return
        }

        const data = await apiClient.getUserById(id)
        if (!data) {
          setError("User not found")
          setLoading(false)
          return
        }
        setUser(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [isAuthenticated, router, params.userId])

  if (!params.userId) {
    return <div className="text-center mt-10">Loading...</div>
  }

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>
  }

  if (!user) {
    return <div className="text-center mt-10">User not found</div>
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1 className="text-2xl font-bold">{user.username}</h1>
      <p className="text-gray-600">{user.email}</p>
    </div>
  )
}
