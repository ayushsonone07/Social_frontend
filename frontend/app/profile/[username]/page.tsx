"use client"

import { useEffect, useState } from "react"

type User = {
  id: number
  username: string
  email: string
}

export default function ProfilePage({
  params,
}: {
  params: { username: string }
}) {

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {

        const res = await fetch(
          `https://backend2-seven-sigma.vercel.app/users/${params.username}`
        )

        const data = await res.json()

        setUser(data)

      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [params.username])

  if (loading) {
    return (
      <div className="flex justify-center mt-20 text-xl">
        Loading profile...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex justify-center mt-20 text-xl">
        User not found
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto mt-10">

      <h1 className="text-2xl font-bold mb-6">
        {user.username}'s Profile
      </h1>

      <div className="p-6 border rounded-lg shadow-sm bg-white">

        <div className="flex items-center gap-4 mb-6">

          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-xl font-semibold">
              {user.username}
            </h2>

            <p className="text-gray-500">
              {user.email}
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}