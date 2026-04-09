"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"
import styles from "./register.module.css"

interface FormErrors {
  username?: string
  email?: string
  password?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const { register, isAuthenticated, isLoading, error, clearError } = useAuthStore()

  const [username, setUsername] = useState("")
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

    if (!username) {
      newErrors.username = "Username is required"
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    }

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

    const success = await register({ username, email, password })

    if (success) {
      router.push("/login")
    } else {
      setSubmitError(error || "Registration failed. Please try logging in.")
    }
  }

  return (
    <div className={styles["register-page"]}>
      <div className={styles["register-left"]}>
        <div className={styles["register-brand"]}>
          <p>Join us</p>
          <h1>Social</h1>
        </div>

        <div className={styles["register-form-container"]}>
          <h2>Create Account</h2>
          <p className={styles.subtitle}>Start your journey with us today</p>

          {(submitError || error) && (
            <div className={styles["register-error"]}>
              {submitError || error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={`${styles["input-group"]} ${errors.username ? styles["has-error"] : ""}`}>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  if (errors.username) {
                    setErrors({ ...errors, username: undefined })
                  }
                }}
                placeholder="Choose a username"
                className={errors.username ? styles.error : ""}
              />
              {errors.username && (
                <span className={styles["error-message"]}>{errors.username}</span>
              )}
            </div>

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
                placeholder="Create a password"
                className={errors.password ? styles.error : ""}
              />
              {errors.password && (
                <span className={styles["error-message"]}>{errors.password}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={styles["register-submit"]}
            >
              {isLoading ? <><span className={styles.spinner}></span>Creating account...</> : "Create Account"}
            </button>
          </form>

          <p className={styles["register-footer"]}>
            Already have an account?{" "}
            <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>

      <div className={styles["register-right"]}>
        <div className={styles["register-decoration"]}></div>
        <div className={styles["register-image-container"]}>
          <div className={styles["register-quote"]}>
            <p>&ldquo;The only way to do great work is to love what you do.&rdquo;</p>
            <cite>— Steve Jobs</cite>
          </div>
        </div>
      </div>
    </div>
  )
}
