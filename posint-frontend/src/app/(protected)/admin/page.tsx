import type { Metadata } from "next"
import { AdminDashboard } from "@/features/admin/components/AdminDashboard"

export const metadata: Metadata = {
  title: "Admin Overview — POSINT",
  description: "POSINT admin dashboard overview.",
}

export default function Page() {
  return <AdminDashboard />
}
