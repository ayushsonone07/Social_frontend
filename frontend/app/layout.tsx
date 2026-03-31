import "./globals.css"
import Navbar from "@/components/Navbar"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">

        <Navbar />

        <main className="max-w-4xl mx-auto p-4">
          {children}
        </main>

      </body>
    </html>
  )
}