import type { Metadata } from "next"
import { UserDashboard } from "@/features/auth/components/UserDashboard"

export const metadata: Metadata = {
  title: "Dashboard — POSINT",
  description: "Your POSINT account dashboard.",
}

export default function Page() {
  return <UserDashboard />
}
