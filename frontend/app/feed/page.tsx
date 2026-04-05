"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useAuthStore } from "@/store/auth"
import CreatePost from "@/components/CreatePost"

interface Post {
  id: number
  content: string
  user: {
    username: string
  }
}

export default function FeedPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])

  const loadPosts = useCallback(async () => {
    try {
      const data = await apiClient.request<Post[]>("/posts", { method: "GET" })
      setPosts(data)
    } catch (error) {
      console.error("Error loading posts:", error)
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    
    loadPosts()
  }, [isAuthenticated, router, loadPosts])

  function handleNewPost(post: Post) {
    setPosts(prev => [post, ...prev])
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <CreatePost onPostCreated={handleNewPost} />
      <h1 className="text-2xl font-bold mb-6">Feed</h1>

      {posts.map((post) => (
        <div key={post.id} className="bg-white shadow p-4 mb-4 rounded-lg">
          <h2 className="font-semibold">{post.user?.username}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  )
}