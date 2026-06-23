"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { apiPost } from "@/shared/lib/api"
import { useAuthStore } from "@/shared/stores/useAuthStore"
import type { AuthResponse, LoginDto, SignupDto } from "../api/auth.types"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().optional(),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type SignupFormValues = z.infer<typeof signupSchema>

export function useLoginForm() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true)
    try {
      const data = await apiPost<AuthResponse>("/auth/login", values as LoginDto)
      setAuth(data.user, data.accessToken, data.refreshToken)
      toast.success("Signed in successfully")
      router.push("/")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return { form, onSubmit, isLoading }
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const router = useRouter()
  return async function logout() {
    try { await apiPost("/auth/logout", {}) } catch {}
    clearAuth()
    router.push("/login")
  }
}

export function useSignupForm() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", displayName: "" },
  })

  async function onSubmit(values: SignupFormValues) {
    setIsLoading(true)
    try {
      const payload: SignupDto = {
        email: values.email,
        password: values.password,
        ...(values.displayName && { displayName: values.displayName }),
      }
      const data = await apiPost<AuthResponse>("/auth/signup", payload)
      setAuth(data.user, data.accessToken, data.refreshToken)
      toast.success("Account created successfully")
      router.push("/")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return { form, onSubmit, isLoading }
}
