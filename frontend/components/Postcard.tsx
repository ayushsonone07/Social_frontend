"use client"

import { useState } from "react"
import { likePost, createComment } from "../services/postservice"

export default function PostCard({ post }: any) {

  const [likes, setLikes] = useState(post.likes || 0)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState(post.comments || [])

  const handleLike = async () => {
    await likePost(post.id)
    setLikes(likes + 1)
  }

  const handleComment = async () => {
    if (!comment.trim()) return

    const newComment = await createComment(post.id, comment)

    setComments([...comments, newComment])
    setComment("")
  }

  return (
    <div className="border rounded p-4 mb-4">

      <p className="mb-2">{post.content}</p>

      <button
        onClick={handleLike}
        className="text-blue-500 text-sm mr-4"
      >
        ❤️ {likes}
      </button>

      <div className="mt-3 flex gap-2">

        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write comment..."
          className="border p-1 flex-1"
        />

        <button
          onClick={handleComment}
          className="bg-blue-500 text-white px-3"
        >
          Comment
        </button>

      </div>

      <div className="mt-3">
        {comments.map((c: any, i: number) => (
          <div key={i} className="text-sm border-t py-1">
            {c.content}
          </div>
        ))}
      </div>

    </div>
  )
}