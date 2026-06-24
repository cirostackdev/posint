import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface User {
  id: string
  email: string
  displayName: string | null
  role: "USER" | "EDITOR" | "ADMIN"
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
}

function syncCookie(token: string | null) {
  if (typeof document === "undefined") return
  const isProduction = process.env.NODE_ENV === "production"
  if (token) {
    // Set a non-httpOnly cookie readable by Next.js middleware
    // Expires in 7 days (matches refresh token lifetime)
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
    const secureFlag = isProduction ? "; Secure" : ""
    document.cookie = `posint-access=${token}; path=/; expires=${expires}; SameSite=Lax${secureFlag}`
  } else {
    document.cookie = "posint-access=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        syncCookie(accessToken)
        set({ user, accessToken, refreshToken, isAuthenticated: true })
      },
      clearAuth: () => {
        syncCookie(null)
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },
    }),
    {
      name: "posint-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
