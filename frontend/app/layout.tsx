"use client"

import { usePathname } from "next/navigation"
import "./globals.css"
import Navbar from "@/components/Navbar"
import { AuthProvider } from "@/store/AuthProvider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login" || pathname === "/register"

  return (
    <html lang="en">
      <body className="bg-gray-100">
        <AuthProvider>
          {!isAuthPage && <Navbar />}
          <main className={isAuthPage ? "" : "max-w-4xl mx-auto p-4"}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
