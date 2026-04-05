"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth"
import CreatePost from "@/components/CreatePost"
import PostCard from "@/components/PostCard"
import styles from "./feed.module.css"

interface Post {
  id: number
  content: string
  user_id: number
  user?: {
    id: number
    username: string
  }
}

export default function FeedPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const loadPosts = useCallback(async () => {
    try {
      const data = await apiClient.request<Post[]>("/posts", { method: "GET" })
      
      const postsWithUsers = await Promise.all(
        data.map(async (post) => {
          try {
            const userData = await apiClient.getUserById(post.user_id)
            return { ...post, user: userData || undefined }
          } catch {
            return post
          }
        })
      )
      
      setPosts(postsWithUsers.reverse())
    } catch (error) {
      console.error("Error loading posts:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    
    loadPosts()
  }, [isAuthenticated, router, loadPosts])

  const handleLike = async (postId: number) => {
    await apiClient.request(`/posts/${postId}/like`, { method: "POST" })
  }

  const handleComment = async (postId: number, content: string) => {
    await apiClient.request("/comments", {
      method: "POST",
      body: JSON.stringify({ content, post_id: postId })
    })
  }

  const handleNewPost = (post: Post) => {
    setPosts(prev => [{
      ...post,
      user: user ? { id: user.id, username: user.username } : undefined
    }, ...prev])
  }

  const handleDeletePost = (postId: number) => {
    setPosts(prev => prev.filter(p => p.id !== postId))
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className={styles.feedContainer}>
      <div className={styles.feedHeader}>
        <h1>Feed</h1>
      </div>

      <CreatePost 
        onPostCreated={handleNewPost} 
        currentUserId={user?.id}
        currentUsername={user?.username}
      />

      <div className={styles.postsSection}>
        {loading ? (
          <div className={styles.loading}>Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className={styles.empty}>
            <p>No posts yet. Be the first to post something!</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onLike={handleLike}
              onComment={handleComment}
              onPostDeleted={handleDeletePost}
            />
          ))
        )}
      </div>
    </div>
  )
}
