import type { Metadata } from "next"
import { SignupForm } from "@/features/auth/components/SignupForm"

export const metadata: Metadata = {
  title: "Create Account — POSINT",
  description: "Create a free account on POSINT — Nigerian Political Intelligence Platform.",
}

export default function Page() {
  return <SignupForm />
}
