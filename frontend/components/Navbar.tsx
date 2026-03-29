"use client"

import Link from "next/link"

export default function Navbar() {
  return (
    <nav className="flex gap-6 p-4 border-b bg-white">

      <Link href="/feed" className="font-medium">
        Feed
      </Link>

      <Link href="/profile" className="font-medium">
        Profile
      </Link>

      <Link href="/login" className="font-medium">
        Login
      </Link>

      <Link href="/register" className="font-medium">
        Register
      </Link>

    </nav>
  )
}