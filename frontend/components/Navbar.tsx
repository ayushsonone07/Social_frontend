"use client"

import Link from "next/link"
import { useAuthStore } from "@/store/auth"
import styles from "./Navbar.module.css"

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore()

  const profileLink = user?.id ? `/profile/${user.id}` : "#"

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles["navbar-brand"]}>
        Social
      </Link>

      <div className={styles["navbar-nav"]}>
        {isAuthenticated && user?.username ? (
          <>
            <Link href="/feed" className={`${styles["nav-link"]} ${styles.primary}`}>
              Feed
            </Link>
            <div className={styles["nav-user"]}>
              <span className={styles["nav-username"]}>@{user.username}</span>
              <Link 
                href={profileLink}
                className={`${styles["nav-link"]} ${styles.secondary}`}
              >
                Profile
              </Link>
            </div>
            <button
              onClick={logout}
              className={`${styles["nav-link"]} ${styles.danger} ${styles["nav-logout"]}`}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className={`${styles["nav-link"]} ${styles.primary}`}>
              Sign In
            </Link>
            <Link href="/register" className={`${styles["nav-link"]} ${styles.secondary}`}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
