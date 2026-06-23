"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/shared/stores/useAuthStore"
import { DashboardShell } from "@/shared/components/layout/DashboardShell"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.replace("/")
    }
  }, [user, router])

  if (!user || user.role !== "ADMIN") {
    return null
  }

  return <DashboardShell title="Admin">{children}</DashboardShell>
}
