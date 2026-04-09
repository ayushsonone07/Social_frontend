import { create } from "zustand"
import { apiClient, Post, Comment } from "@/lib/api-client"

interface PostStore {
  posts: Post[]
  isLoading: boolean
  error: string | null

  fetchPosts: () => Promise<void>
  addPost: (content: string) => Promise<Post | null>
  deletePost: (postId: number) => void
  likePost: (postId: number) => Promise<void>
  addComment: (postId: number, content: string) => Promise<Comment | null>
  getPosts: () => Post[]
  getUserPosts: (userId: number) => Post[]
}

export const usePostStore = create<PostStore>((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null })
    try {
      const posts = await apiClient.getPosts()
      set({ posts, isLoading: false })
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to fetch posts", isLoading: false })
    }
  },

  addPost: async (content: string) => {
    try {
      const post = await apiClient.createPost(content)
      set(state => ({ posts: [post, ...state.posts] }))
      return post
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Failed to create post" })
      return null
    }
  },

  deletePost: (postId: number) => {
    set(state => ({ posts: state.posts.filter(p => p.id !== postId) }))
  },

  likePost: async (postId: number) => {
    try {
      await apiClient.likePost(postId)
      set(state => ({
        posts: state.posts.map(p => 
          p.id === postId 
            ? { 
                ...p, 
                is_liked: !p.is_liked, 
                likes_count: p.is_liked ? (p.likes_count || 1) - 1 : (p.likes_count || 0) + 1 
              }
            : p
        )
      }))
    } catch (error) {
      console.error("Error liking post:", error)
    }
  },

  addComment: async (postId: number, content: string) => {
    try {
      const comment = await apiClient.createComment(postId, content)
      set(state => ({
        posts: state.posts.map(p => 
          p.id === postId 
            ? { ...p, comments_count: (p.comments_count || 0) + 1 }
            : p
        )
      }))
      return comment
    } catch (error) {
      console.error("Error adding comment:", error)
      return null
    }
  },

  getPosts: () => get().posts,

  getUserPosts: (userId: number) => {
    return get().posts.filter(p => p.user_id === userId)
  }
}))