"use client"

import { useEffect, useState } from "react"

type User = {
  id: number
  username: string
  email: string
}

export default function Feed() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("https://backend2-seven-sigma.vercel.app/users")

        const data = await res.json()

        setUsers(data)
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center mt-20 text-xl">
        Loading feed...
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-4">

      <h1 className="text-2xl font-bold mb-6">
        Feed
      </h1>

      {users.map((user) => (
        <div
          key={user.id}
          className="p-4 border rounded-lg shadow-sm bg-white"
        >
          <h2 className="font-semibold text-lg">
            {user.username}
          </h2>

          <p className="text-gray-500 text-sm">
            {user.email}
          </p>
        </div>
      ))}

    </div>
  )
}