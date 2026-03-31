export const setUser = (user: any) => {
  localStorage.setItem("user", JSON.stringify(user))
}

export const getUser = () => {
  if (typeof window === "undefined") return null
  return JSON.parse(localStorage.getItem("user") || "null")
}

export const logout = () => {
  localStorage.removeItem("user")
}