"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/shared/stores/useAuthStore"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/")
    }
  }, [isAuthenticated, router])

  return (
    <div className="min-h-screen bg-background dark flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background pointer-events-none" />
      <div className="relative w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}
