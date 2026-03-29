"use client"

import { useEffect, useState } from "react"
import { getMe } from "../../services/authservice"

export default function ProfilePage() {

  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => {
        window.location.href = "/login"
      })
  }, [])

  if (!user) return <p>Loading...</p>

  return (
    <div className="max-w-lg mx-auto mt-20">

      <h1 className="text-2xl font-bold mb-4">
        Profile
      </h1>

      <div className="border p-4 rounded">

        <p>
          <strong>Username:</strong> {user.username}
        </p>

        <p>
          <strong>Email:</strong> {user.email}
        </p>

      </div>

    </div>
  )
}