"use client"

import { useState } from "react"
import { createPost } from "../services/postservice"

export default function CreatePost({ onPostCreated }: any) {

  const [content, setContent] = useState("")

  const submit = async () => {
    if (!content.trim()) return

    const newPost = await createPost(content)

    onPostCreated(newPost)

    setContent("")
  }

  return (
    <div className="border p-4 rounded mb-6">

      <textarea
        className="w-full border p-2 mb-3"
        value={content}
        placeholder="What's on your mind?"
        onChange={(e) => setContent(e.target.value)}
      />

      <button
        onClick={submit}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Post
      </button>

    </div>
  )
}