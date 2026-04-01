"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

type User = {
  username: string
  email: string
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else {
      setUser(null)
    }
  }, [pathname]) // 👈 runs when route changes

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/login"
  }

  return (
    <nav className="flex items-center justify-between px-4 py-3 border-b bg-white">

      <Link href="/" className="text-xl font-bold hidden md:block">
        SocialApp
      </Link>

      <div className="flex items-center gap-2 md:gap-4 ml-auto">

        {user ? (
          <>
            <Link
              href="/feed"
              className="px-3 py-1 rounded bg-blue-500 text-white text-sm"
            >
              Feed
            </Link>

            <Link
              href={`/profile/${user.username}`}
              className="px-3 py-1 rounded bg-gray-200 text-sm"
            >
              Profile
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded bg-red-500 text-white text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="px-3 py-1 rounded bg-blue-500 text-white text-sm"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="px-3 py-1 rounded bg-gray-200 text-sm"
            >
              Register
            </Link>
          </>
        )}

      </div>
    </nav>
  )
}