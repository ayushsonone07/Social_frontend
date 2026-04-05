import { useState } from "react"
import { apiClient } from "@/lib/api-client"
import styles from "./CreatePost.module.css"

interface Post {
  id: number
  content: string
  user_id: number
}

interface CreatePostProps {
  onPostCreated?: (post: Post) => void
  currentUserId?: number
  currentUsername?: string
}

export default function CreatePost({ onPostCreated, currentUserId, currentUsername }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    setLoading(true)

    try {
      const newPost = await apiClient.request<Post>("/posts", {
        method: "POST",
        body: JSON.stringify({ content })
      })

      setContent("")

      if (onPostCreated) {
        onPostCreated({
          ...newPost,
          user_id: currentUserId || 0
        })
      }
    } catch (error) {
      console.error(error)
      alert("Failed to create post")
    }

    setLoading(false)
  }

  return (
    <div className={styles.createPost}>
      <div className={styles.createPostHeader}>
        <div className={styles.avatar}>
          {currentUsername?.charAt(0).toUpperCase() || "U"}
        </div>
        <span className={styles.placeholder}>What&apos;s on your mind?</span>
      </div>
      
      <form onSubmit={handleSubmit}>
        <textarea
          placeholder="What&apos;s on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.textarea}
          rows={3}
        />

        <div className={styles.submitRow}>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className={styles.submitBtn}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  )
}
