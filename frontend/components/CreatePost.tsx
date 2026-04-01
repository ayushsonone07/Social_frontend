"use client"

import { useState } from "react"
import { createPost } from "@/lib/api"

export default function CreatePost({ onPostCreated }: any) {
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    setLoading(true)

    try {
      const newPost = await createPost(content)

      setContent("")

      if (onPostCreated) {
        onPostCreated(newPost)
      }

    } catch (error) {
      console.error(error)
      alert("Failed to create post")
    }

    setLoading(false)
  }

  return (
    <div className="bg-white shadow p-4 rounded-xl mb-6">
      <form onSubmit={handleSubmit}>

        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Posting..." : "Post"}
        </button>

      </form>
    </div>
  )
}