import { useState } from "react"
import { useAuthStore } from "@/store/auth"
import { usePostStore } from "@/store/posts"
import styles from "./CreatePost.module.css"

interface Post {
  id: number
  content: string
  user_id: number
  created_at: string
  user?: {
    id: number
    username: string
  }
  likes_count?: number
  comments_count?: number
  is_liked?: boolean
}

interface CreatePostProps {
  onPostCreated?: () => void
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuthStore()
  const addPost = usePostStore(state => state.addPost)
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    setLoading(true)
    setError(null)

    try {
      await addPost(content)

      setContent("")
      setIsOpen(false)
      
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post")
    }

    setLoading(false)
  }

  return (
    <>
      <button className={styles.openBtn} onClick={() => setIsOpen(true)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>
        </svg>
        Create Post
      </button>

      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Create Post</h3>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className={styles.username}>@{user?.username || "user"}</span>
              </div>

              <form onSubmit={handleSubmit}>
                <textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={styles.textarea}
                  autoFocus
                  rows={5}
                />

                {error && <p className={styles.error}>{error}</p>}

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
          </div>
        </div>
      )}
    </>
  )
}
