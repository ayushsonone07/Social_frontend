"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"
import styles from "./login.module.css"

interface FormErrors {
  email?: string
  password?: string
}

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push("/feed")
    }
  }, [mounted, isAuthenticated, router])

  useEffect(() => {
    return () => {
      clearError()
    }
  }, [clearError])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validateForm()) {
      return
    }

    const success = await login({ email, password })

    if (success) {
      router.push("/feed")
    } else {
      setSubmitError(error || "Invalid credentials")
    }
  }

  return (
    <div className={styles["login-page"]}>
      <div className={styles["login-left"]}>
        <div className={styles["login-brand"]}>
          <p>Welcome back</p>
          <h1>Social</h1>
        </div>

        <div className={styles["login-form-container"]}>
          <h2>Sign In</h2>
          <p className={styles.subtitle}>Enter your credentials to access your account</p>

          {(submitError || error) && (
            <div className={styles["login-error"]}>
              {submitError || error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={`${styles["input-group"]} ${errors.email ? styles["has-error"] : ""}`}>
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) {
                    setErrors({ ...errors, email: undefined })
                  }
                }}
                placeholder="you@example.com"
                className={errors.email ? styles.error : ""}
              />
              {errors.email && (
                <span className={styles["error-message"]}>{errors.email}</span>
              )}
            </div>

            <div className={`${styles["input-group"]} ${errors.password ? styles["has-error"] : ""}`}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) {
                    setErrors({ ...errors, password: undefined })
                  }
                }}
                placeholder="Enter your password"
                className={errors.password ? styles.error : ""}
              />
              {errors.password && (
                <span className={styles["error-message"]}>{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles["login-submit"]}
            >
              {isLoading ? <><span className={styles.spinner}></span>Signing in...</> : "Sign In"}
            </button>
          </form>

          <p className={styles["login-footer"]}>
            Do not have an account?{" "}
            <Link href="/register">Create one</Link>
          </p>
        </div>
      </div>

      <div className={styles["login-right"]}>
        <div className={styles["login-decoration"]}></div>
        <div className={styles["login-image-container"]}>
          <div className={styles["login-quote"]}>
            <p>&ldquo;The best way to find yourself is to lose yourself in the service of others.&rdquo;</p>
            <cite>— Mahatma Gandhi</cite>
          </div>
        </div>
      </div>
    </div>
  )
}
