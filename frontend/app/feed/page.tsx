"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"
import { usePostStore } from "@/store/posts"
import CreatePost from "@/components/CreatePost"
import PostCard from "@/components/PostCard"
import styles from "./feed.module.css"

export default function FeedPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { posts, fetchPosts, likePost, addComment, deletePost } = usePostStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.push("/login")
    }
  }, [ready, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts()
    }
  }, [isAuthenticated, fetchPosts])

  const handleLike = async (postId: number) => {
    await likePost(postId)
  }

  const handleComment = async (postId: number, content: string) => {
    await addComment(postId, content)
  }

  const handleDeletePost = (postId: number) => {
    deletePost(postId)
  }

  const handlePostCreated = () => {
    fetchPosts()
  }

  if (!ready) return null

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className={styles.feedContainer}>
      <div className={styles.feedHeader}>
        <h1>Feed</h1>
      </div>

      <CreatePost onPostCreated={handlePostCreated} />

      <div className={styles.postsSection}>
        {posts.length === 0 ? (
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
