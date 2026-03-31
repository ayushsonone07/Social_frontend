const API_URL = "https://backend2-seven-sigma.vercel.app"

export async function loginUser(data: any) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  return res.json()
}

export async function registerUser(data: any) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  return res.json()
}

export async function getUsers() {
  const res = await fetch(`${API_URL}/users`)
  return res.json()
}