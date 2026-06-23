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

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      clearAuth: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    {
      name: "posint-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
