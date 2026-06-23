import type { Metadata } from "next"
import { LoginForm } from "@/features/auth/components/LoginForm"

export const metadata: Metadata = {
  title: "Sign In — POSINT",
  description: "Sign in to POSINT — Nigerian Political Intelligence Platform.",
}

export default function Page() {
  return <LoginForm />
}
