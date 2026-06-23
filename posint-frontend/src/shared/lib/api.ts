const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"

type ApiResponse<T> = {
  statusCode: number
  message: string
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    const auth = JSON.parse(localStorage.getItem("posint-auth") ?? "{}")
    return auth?.state?.accessToken ?? null
  } catch {
    return null
  }
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  const token = getAccessToken()
  if (token) headers["Authorization"] = `Bearer ${token}`
  return headers
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    // Attempt token refresh
    const refreshed = await attemptRefresh()
    if (!refreshed) {
      if (typeof window !== "undefined") window.location.href = "/login"
      throw new ApiError(401, "Unauthorized")
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(response.status, body?.message ?? `HTTP ${response.status}`)
  }

  const body: ApiResponse<T> = await response.json()
  // Paginated list responses have `meta` at the envelope root alongside `data`.
  // Return both so list components can access data.data and data.meta.
  if (body.meta !== undefined) {
    return { data: body.data, meta: body.meta } as unknown as T
  }
  return body.data
}

async function attemptRefresh(): Promise<boolean> {
  try {
    const auth = JSON.parse(localStorage.getItem("posint-auth") ?? "{}")
    const refreshToken = auth?.state?.refreshToken
    if (!refreshToken) return false

    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false

    const data = await res.json()
    const newAuth = { ...auth, state: { ...auth.state, accessToken: data.data.accessToken, refreshToken: data.data.refreshToken } }
    localStorage.setItem("posint-auth", JSON.stringify(newAuth))
    return true
  } catch {
    return false
  }
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | null | undefined>): string {
  const url = new URL(`${API_BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== "") {
        url.searchParams.set(key, String(val))
      }
    })
  }
  return url.toString()
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>,
): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    headers: getHeaders(),
    cache: "no-store",
  })
  return handleResponse<T>(response)
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}

export async function apiDelete(path: string): Promise<void> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: getHeaders(),
  })
  await handleResponse<void>(response)
}

export type { ApiError }
