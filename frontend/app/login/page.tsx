"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { loginUser } from "@/lib/api"
import { useUser } from "@/context/UserContext"

type FormData = {
  email: string
  password: string
}

export default function LoginForm() {
  const router = useRouter()
  const { setUser } = useUser()

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = await loginUser(formData)

    console.log(data)
    setUser(data.user)
    localStorage.setItem("token", data.access_token)

    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email
      })
    )

    router.push("/feed")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Login
        </h2>

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block mb-1 text-sm font-medium">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Login
        </button>

        <p className="text-sm text-center mt-4">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-800">
            Register
          </Link>
        </p>

      </form>

    </div>
  )
}