"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth"
import styles from "./profile.module.css"

interface UserProfile {
  id: number
  username: string
  email: string
}

interface Post {
  id: number
  content: string
  user_id: number
}

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { user: currentUser, isAuthenticated } = useAuthStore()
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
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

        const userData = await apiClient.getUserById(id)
        if (!userData) {
          setError("User not found")
          setLoading(false)
          return
        }
        setProfileUser(userData)

        const allPosts = await apiClient.request<Post[]>("/posts", { method: "GET" })
        const userPosts = allPosts.filter(p => p.user_id === id).reverse()
        setPosts(userPosts)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [isAuthenticated, router, params.userId])

  const _handleDeletePost = (postId: number) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  const _handleLike = async (postId: number) => {
    await apiClient.request(`/posts/${postId}/like`, { method: "POST" })
  }

  const _handleComment = async (postId: number, content: string) => {
    await apiClient.request("/comments", {
      method: "POST",
      body: JSON.stringify({ content, post_id: postId })
    })
  }

  const _isOwnProfile = profileUser && currentUser?.id === profileUser.id

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

  const isOwnProfile = currentUser?.id === profileUser.id

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
          <span className={styles.statNumber}>{posts.length}</span>
          <span className={styles.statLabel}>Posts</span>
        </div>
      </div>

      <div className={styles.postsSection}>
        <h2>Posts</h2>
        {posts.length === 0 ? (
          <div className={styles.noPosts}>No posts yet</div>
        ) : (
          posts.map(post => (
            <div key={post.id} className={styles.profilePost}>
              <p>{post.content}</p>
              <div className={styles.postMeta}>
                <span>Just now</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
