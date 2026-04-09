"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth"
import { usePostStore } from "@/store/posts"
import styles from "./profile.module.css"

interface UserProfile {
  id: number
  username: string
  email: string
}

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { user: currentUser, isAuthenticated } = useAuthStore()
  const posts = usePostStore(state => state.posts)
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready && !isAuthenticated) {
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

        const userData = await apiClient.getUserById(id)
        if (!userData) {
          setError("User not found")
          setLoading(false)
          return
        }
        setProfileUser(userData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [ready, isAuthenticated, router, params.userId])

  if (!ready) return null

  if (!params.userId || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>User not found</div>
      </div>
    )
  }

  const userPosts = posts
    .filter(p => p.user_id === profileUser.id)
    .sort((a, b) => new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime())

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <div className={styles.avatar}>
          {profileUser.username.charAt(0).toUpperCase()}
        </div>
        <div className={styles.profileInfo}>
          <h1>@{profileUser.username}</h1>
          <p>{profileUser.email}</p>
        </div>
      </div>

      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>{userPosts.length}</span>
          <span className={styles.statLabel}>Posts</span>
        </div>
      </div>

      <div className={styles.postsSection}>
        <h2>Posts</h2>
        {userPosts.length === 0 ? (
          <div className={styles.noPosts}>No posts yet</div>
        ) : (
          userPosts.map(post => (
            <div key={post.id} className={styles.profilePost}>
              <p>{post.content}</p>
              <div className={styles.postMeta}>
                <span>{new Date(post.created_at || "").toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
