import { useState } from "react"
import Link from "next/link"
import { usePostStore } from "@/store/posts"
import styles from "./PostCard.module.css"

interface PostUser {
  id: number
  username: string
}

interface Comment {
  id: number
  content: string
  user_id: number
  post_id: number
  created_at?: string
  user?: PostUser
}

interface Post {
  id: number
  content: string
  user_id: number
  created_at?: string
  user?: PostUser
  likes_count?: number
  comments_count?: number
  is_liked?: boolean
}

interface PostCardProps {
  post: Post
  currentUserId?: number
  onLike?: (postId: number) => Promise<void>
  onComment?: (postId: number, content: string) => Promise<void>
  onPostDeleted?: (postId: number) => void
}

export default function PostCard({ post, currentUserId, onPostDeleted }: PostCardProps) {
  const [liked, setLiked] = useState(post.is_liked || false)
  const [likeCount, setLikeCount] = useState(post.likes_count || 0)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [commenting, setCommenting] = useState(false)
  const [posting, setPosting] = useState(false)

  const likePost = usePostStore(state => state.likePost)
  const addCommentToStore = usePostStore(state => state.addComment)

  const handleLike = async () => {
    if (posting) return
    
    try {
      setPosting(true)
      await likePost(post.id)
      setLiked(!liked)
      setLikeCount(prev => liked ? prev - 1 : prev + 1)
    } catch (error) {
      console.error("Error liking post:", error)
    } finally {
      setPosting(false)
    }
  }

  const handleComment = async () => {
    if (!newComment.trim() || commenting) return
    
    try {
      setCommenting(true)
      const comment = await addCommentToStore(post.id, newComment.trim())
      if (comment) {
        setComments(prev => [...prev, { 
          id: comment.id, 
          content: comment.content, 
          user_id: currentUserId || 0, 
          post_id: post.id 
        }])
      }
      setNewComment("")
    } catch (error) {
      console.error("Error commenting:", error)
    } finally {
      setCommenting(false)
    }
  }

  const isOwnPost = currentUserId && post.user_id === currentUserId

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Just now"
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={styles.postCard}>
      <div className={styles.postHeader}>
        <div className={styles.avatar}>
          {post.user?.username?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className={styles.headerInfo}>
          <Link href={`/profile/${post.user_id}`} className={styles.username}>
            @{post.user?.username || `user${post.user_id}`}
          </Link>
          <span className={styles.timestamp}>{formatDate(post.created_at)}</span>
        </div>
        {isOwnPost && (
          <button className={styles.deleteBtn} onClick={() => onPostDeleted?.(post.id)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
            </svg>
          </button>
        )}
      </div>

      <div className={styles.postContent}>
        <p>{post.content}</p>
      </div>

      <div className={styles.postStats}>
        <span>{likeCount > 0 ? `${likeCount} likes` : "No likes yet"}</span>
        <span>{(post.comments_count || 0) > 0 ? `${post.comments_count} comments` : ""}</span>
      </div>

      <div className={styles.postActions}>
        <button 
          className={`${styles.actionBtn} ${liked ? styles.liked : ""}`}
          onClick={handleLike}
          disabled={posting}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          {liked ? "Liked" : "Like"}
        </button>
        <button 
          className={styles.actionBtn}
          onClick={() => setShowComments(!showComments)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          Comment
        </button>
      </div>

      {showComments && (
        <div className={styles.commentsSection}>
          {comments.length > 0 && (
            <div className={styles.commentsList}>
              {comments.map(comment => (
                <div key={comment.id} className={styles.comment}>
                  <div className={styles.commentAvatar}>
                    {comment.user_id.toString().charAt(0)}
                  </div>
                  <div className={styles.commentContent}>
                    <span className={styles.commentUser}>user{comment.user_id}</span>
                    <p>{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.commentInput}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleComment()}
            />
            <button 
              onClick={handleComment}
              disabled={!newComment.trim() || commenting}
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  )
}