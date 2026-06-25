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

// ─── Token Refresh Mutex ─────────────────────────────────
// Ensures only one refresh call happens at a time.
// Concurrent 401s share the same refresh promise and all retry together.
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    const auth = JSON.parse(localStorage.getItem("posint-auth") ?? "{}")
    return auth?.state?.accessToken ?? null
  } catch {
    return null
  }
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    const auth = JSON.parse(localStorage.getItem("posint-auth") ?? "{}")
    return auth?.state?.refreshToken ?? null
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

async function attemptRefresh(): Promise<boolean> {
  // If already refreshing, wait for the existing attempt instead of starting a new one
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken()
      if (!refreshToken) return false

      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      })
      if (!res.ok) return false

      const body = await res.json()
      const newAccess = body.data?.accessToken ?? body.accessToken
      const newRefresh = body.data?.refreshToken ?? body.refreshToken
      if (!newAccess || !newRefresh) return false

      // Update localStorage so subsequent getAccessToken() calls return the new token
      const auth = JSON.parse(localStorage.getItem("posint-auth") ?? "{}")
      auth.state = { ...auth.state, accessToken: newAccess, refreshToken: newRefresh }
      localStorage.setItem("posint-auth", JSON.stringify(auth))

      // Sync cookie for middleware (matches useAuthStore syncCookie logic)
      const isProduction = process.env.NODE_ENV === "production"
      const secureFlag = isProduction ? "; Secure" : ""
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString()
      document.cookie = `posint-access=${newAccess}; path=/; expires=${expires}; SameSite=Lax${secureFlag}`

      return true
    } catch {
      return false
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

async function fetchWithRefresh(url: string, options: RequestInit): Promise<Response> {
  let response = await fetch(url, options)

  if (response.status === 401) {
    const refreshed = await attemptRefresh()
    if (refreshed) {
      // Retry the original request with the newly obtained token
      const newHeaders = { ...(options.headers as Record<string, string>) }
      newHeaders["Authorization"] = `Bearer ${getAccessToken()}`
      response = await fetch(url, { ...options, headers: newHeaders })
    } else {
      // Refresh failed — session is gone, send to login
      if (typeof window !== "undefined") {
        const path = window.location.pathname
        window.location.href = `/login?redirect=${encodeURIComponent(path)}`
      }
      throw new ApiError(401, "Session expired")
    }
  }

  return response
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(response.status, body?.message ?? `HTTP ${response.status}`)
  }

  const body: ApiResponse<T> = await response.json()
  if (body.meta !== undefined) {
    return { data: body.data, meta: body.meta } as unknown as T
  }
  return body.data
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>,
): string {
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
  const response = await fetchWithRefresh(buildUrl(path, params), {
    headers: getHeaders(),
    cache: "no-store",
  })
  return handleResponse<T>(response)
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetchWithRefresh(`${API_BASE}${path}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetchWithRefresh(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(body),
  })
  return handleResponse<T>(response)
}

export async function apiDelete(path: string): Promise<void> {
  const response = await fetchWithRefresh(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: getHeaders(),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(response.status, body?.message ?? `HTTP ${response.status}`)
  }
}

export async function apiGetCursor<T>(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined> & { cursor?: string | null },
): Promise<{ data: T[]; nextCursor: string | null; hasMore: boolean }> {
  const response = await fetchWithRefresh(buildUrl(path, params), {
    headers: getHeaders(),
    cache: "no-store",
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(response.status, body?.message ?? `HTTP ${response.status}`)
  }
  const body = await response.json()
  return {
    data: body.data,
    nextCursor: body.meta?.nextCursor ?? null,
    hasMore: body.meta?.hasMore ?? false,
  }
}

export type { ApiError }
