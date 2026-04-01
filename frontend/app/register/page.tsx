"use client"

import { useState } from "react"
import Link from "next/link"
import { registerUser } from "@/lib/api"
import { useRouter } from "next/navigation"

type FormData = {
  username: string
  email: string
  password: string
}

export default function RegisterForm() {
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    username: "",
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

    console.log("Register Data:", formData)

    const data = await registerUser(formData)

    if(data){
      router.push("/login")
    }
    // Example API call
    // await fetch("YOUR_BACKEND_URL/auth/register", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(formData)
    // })
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Create Account
        </h2>

        {/* Username */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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
          Register
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account? <Link href="/login" className="text-blue-800">Login</Link>
        </p>

      </form>

    </div>
  )
}