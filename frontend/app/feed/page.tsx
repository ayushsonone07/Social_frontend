"use client"

import { useEffect, useState } from "react"
import { fetchPosts } from "@/lib/api"
import CreatePost from "@/components/CreatePost"
import { useUser } from "@/context/UserContext"

export default function FeedPage() {
  const { user } = useUser()

  const [posts, setPosts] = useState([])

  useEffect(() => {
    async function loadPosts() {
      const data = await fetchPosts()
      setPosts(data)
    }

    loadPosts()
  }, [])

  console.log(user)

  async function loadPosts() {
    const data = await fetchPosts()
    setPosts(data)
  }

  function handleNewPost(post: any) {
    setPosts([post, ...posts])
  }


  return (
    <div className="max-w-xl mx-auto mt-10">

    <CreatePost onPostCreated={handleNewPost} />
      <h1 className="text-2xl font-bold mb-6">Feed</h1>

      {posts.map((post: any) => (
        <div key={post.id} className="bg-white shadow p-4 mb-4 rounded-lg">
          <h2 className="font-semibold">{post.user?.username}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  )
}