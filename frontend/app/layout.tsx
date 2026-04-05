import "./globals.css"
import Navbar from "@/components/Navbar"
import { UserProvider } from "@/context/UserContext"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
          <Navbar />
        <UserProvider>
          <main className="max-w-4xl mx-auto p-4">
            {children}
          </main>
        </UserProvider>
      </body>
    </html>
  )
}