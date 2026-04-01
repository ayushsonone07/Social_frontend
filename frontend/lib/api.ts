import { useUser } from "@/context/UserContext"

const { user } = useUser()
const API_URL = "https://backend2-seven-sigma.vercel.app/api/v1"

export async function loginUser(data: any) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  return res.json()
}

export async function registerUser(data: any) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  return res.json()
}

export async function getUsers() {
  const res = await fetch(`${API_URL}/users`)
  return res.json()
}

export async function fetchPosts() {
  try {
    const token = localStorage.getItem("token")

    const res = await fetch(`${API_URL}/posts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    })

    if (!res.ok) {
      throw new Error("Failed to fetch posts")
    }

    return await res.json()
  } catch (error) {
    console.error("Error fetching posts:", error)
    throw error
  }
}

export async function createPost(content: string) {
  const token = localStorage.getItem("token")

  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ content })
  })

  if (!res.ok) {
    throw new Error("Failed to create post")
  }

  return res.json()
}

export async function fetchUserProfile(username: string) {
  const res = await fetch(`${API_URL}/users/${user?.id}`, {
    method: "GET",
    cache: "no-store"
  })

  if (!res.ok) {
    const error = await res.text()
    console.error("Backend response:", error)
    throw new Error(`Failed to fetch user profile: ${error}`)
  }

  return res.json()
}