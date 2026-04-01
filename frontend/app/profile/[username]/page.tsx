import { fetchUserProfile } from "@/lib/api"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {

  const { username } = await params   // unwrap params

  const user = await fetchUserProfile(username)

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h1>{user.username}</h1>
      <p>{user.email}</p>
    </div>
  )
}