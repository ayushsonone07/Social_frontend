"use client"

import { useState } from "react"
import { register } from "../../services/authservice"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    try {
      setLoading(true)

      const data = await register({
        username,
        email,
        password
      })

      localStorage.setItem("token", data.access_token)

      window.location.href = "/feed"
    } catch (err) {
      alert("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 max-w-md mx-auto mt-20">

      <h1 className="text-2xl font-bold">Register</h1>

      <input
        placeholder="Username"
        className="border p-2"
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        placeholder="Email"
        className="border p-2"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="border p-2"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={submit}
        className="bg-blue-500 text-white p-2"
      >
        {loading ? "Creating..." : "Register"}
      </button>

    </div>
  )
}