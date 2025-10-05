"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    const initialTheme = savedTheme || (prefersDark ? "dark" : "light")
    setTheme(initialTheme)
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
        <div className="w-4 h-4" />
      </div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="group relative w-10 h-10 rounded-full bg-muted/50 hover:bg-muted hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-md"
      aria-label="Toggle theme"
    >
      <Sun className="w-4 h-4 text-foreground/70 group-hover:text-foreground transition-all duration-300 absolute rotate-0 scale-100 dark:rotate-90 dark:scale-0" />
      <Moon className="w-4 h-4 text-foreground/70 group-hover:text-foreground transition-all duration-300 absolute rotate-90 scale-0 dark:rotate-0 dark:scale-100" />
    </button>
  )
}
