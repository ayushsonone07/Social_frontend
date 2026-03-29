import api from "../lib/api"

export const getPosts = async () => {
  const res = await api.get("/posts")
  return res.data
}

export const createPost = async (content: string) => {
  const res = await api.post("/posts", { content })
  return res.data
}

export const likePost = async (postId: number) => {
  const res = await api.post(`/posts/${postId}/like`)
  return res.data
}

export const deletePost = async (postId: number) => {
  const res = await api.delete(`/posts/${postId}`)
  return res.data
}

export const createComment = async (
  postId: number,
  content: string
) => {
  const res = await api.post(`/posts/${postId}/comments`, {
    content,
  })

  return res.data
}

export const getComments = async (postId: number) => {
  const res = await api.get(`/posts/${postId}/comments`)
  return res.data
}