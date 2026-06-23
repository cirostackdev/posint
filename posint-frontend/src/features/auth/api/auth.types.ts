export interface LoginDto {
  email: string
  password: string
}

export interface SignupDto {
  email: string
  password: string
  displayName?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    displayName: string | null
    role: "USER" | "EDITOR" | "ADMIN"
  }
}
