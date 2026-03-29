"use client"

import { useEffect, useState } from "react"
import { getPosts } from "../../services/postservice"
import PostCard from "../../components/Postcard"
import CreatePost from "../../components/Createpost"

export default function Feed() {

  const [posts, setPosts] = useState<any[]>([])

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    const data = await getPosts()
    setPosts(data)
  }

  const addPost = (post: any) => {
    setPosts([post, ...posts])
  }

  return (
    <div className="max-w-xl mx-auto mt-10">

      <h1 className="text-2xl font-bold mb-6">
        Feed
      </h1>

      <CreatePost onPostCreated={addPost} />

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

    </div>
  )
}