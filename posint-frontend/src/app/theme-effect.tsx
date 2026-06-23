"use client"

import { useEffect } from "react"
import { useThemeStore } from "@/shared/stores/useThemeStore"

export function ThemeEffect() {
  const { theme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    const isDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

    if (isDark) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [theme])

  return null
}
