import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const mockFetch = vi.fn()
global.fetch = mockFetch

describe("API Client", () => {
  beforeEach(() => {
    mockFetch.mockReset()
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => JSON.stringify({ state: { accessToken: "test-token", refreshToken: "refresh-token" } })),
      setItem: vi.fn(),
    })
  })

  afterEach(() => { vi.unstubAllGlobals() })

  it("apiGet returns data from successful response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ statusCode: 200, message: "Success", data: { id: "1", name: "Test" } }),
    })

    const { apiGet } = await import("@/shared/lib/api")
    const result = await apiGet("/politicians/test")
    expect(result).toEqual({ id: "1", name: "Test" })
  })

  it("apiGet appends query params", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ statusCode: 200, message: "Success", data: [] }),
    })

    const { apiGet } = await import("@/shared/lib/api")
    await apiGet("/politicians", { page: 2, party: "APC" })
    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain("page=2")
    expect(url).toContain("party=APC")
  })

  it("apiGet returns data with meta when meta is present", async () => {
    const meta = { page: 1, limit: 10, total: 100, totalPages: 10 }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ statusCode: 200, message: "Success", data: [{ id: "1" }], meta }),
    })

    const { apiGet } = await import("@/shared/lib/api")
    const result = await apiGet<{ data: unknown[]; meta: typeof meta }>("/politicians")
    expect((result as { meta: typeof meta }).meta).toEqual(meta)
  })

  it("apiPost sends body and returns data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ statusCode: 201, message: "Created", data: { id: "new-1" } }),
    })

    const { apiPost } = await import("@/shared/lib/api")
    const result = await apiPost("/reports", { title: "New report" })
    expect(result).toEqual({ id: "new-1" })
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string)
    expect(body.title).toBe("New report")
  })

  it("apiPatch sends PATCH method and returns updated data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ statusCode: 200, message: "Updated", data: { id: "1", title: "Updated" } }),
    })

    const { apiPatch } = await import("@/shared/lib/api")
    const result = await apiPatch("/reports/1", { title: "Updated" })
    expect(result).toEqual({ id: "1", title: "Updated" })
    expect(mockFetch.mock.calls[0][1].method).toBe("PATCH")
  })

  it("apiDelete sends DELETE method without throwing on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => ({}),
    })

    const { apiDelete } = await import("@/shared/lib/api")
    await expect(apiDelete("/reports/1")).resolves.toBeUndefined()
    expect(mockFetch.mock.calls[0][1].method).toBe("DELETE")
  })

  it("apiDelete throws ApiError on failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ message: "Not found" }),
    })

    const { apiDelete } = await import("@/shared/lib/api")
    await expect(apiDelete("/reports/999")).rejects.toThrow("Not found")
  })

  it("apiGet throws ApiError on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ message: "Forbidden" }),
    })

    const { apiGet } = await import("@/shared/lib/api")
    await expect(apiGet("/admin/data")).rejects.toThrow("Forbidden")
  })

  it("apiGetCursor returns cursor-based paginated data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: [{ id: "1" }, { id: "2" }],
        meta: { nextCursor: "cursor-abc", hasMore: true },
      }),
    })

    const { apiGetCursor } = await import("@/shared/lib/api")
    const result = await apiGetCursor("/feed")
    expect(result.data).toHaveLength(2)
    expect(result.nextCursor).toBe("cursor-abc")
    expect(result.hasMore).toBe(true)
  })

  it("apiGetCursor throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: "Server Error" }),
    })

    const { apiGetCursor } = await import("@/shared/lib/api")
    await expect(apiGetCursor("/feed")).rejects.toThrow()
  })

  it("apiGetCursor defaults nextCursor and hasMore when meta absent", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ id: "1" }] }),
    })

    const { apiGetCursor } = await import("@/shared/lib/api")
    const result = await apiGetCursor("/feed")
    expect(result.nextCursor).toBeNull()
    expect(result.hasMore).toBe(false)
  })

  it("on 401 with failed refresh, throws session expired error", async () => {
    // First call returns 401
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
    // Refresh call returns failure
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })

    vi.stubGlobal("window", { location: { pathname: "/test", href: "" } })

    const { apiGet } = await import("@/shared/lib/api")
    await expect(apiGet("/protected")).rejects.toThrow("Session expired")
  })

  it("on 401 with no refresh token, redirects and throws", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })

    // Stub localStorage to return no tokens
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => JSON.stringify({ state: { accessToken: null, refreshToken: null } })),
      setItem: vi.fn(),
    })
    vi.stubGlobal("window", { location: { pathname: "/dashboard", href: "" } })

    const { apiGet } = await import("@/shared/lib/api")
    await expect(apiGet("/secure")).rejects.toThrow("Session expired")
  })

  it("on 401 with successful refresh, retries and returns data", async () => {
    // Initial request returns 401
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
    // Refresh succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { accessToken: "new-token", refreshToken: "new-refresh" } }),
    })
    // Retry request succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ statusCode: 200, message: "OK", data: { id: "1" } }),
    })

    const cookieSetter = vi.fn()
    vi.stubGlobal("document", { cookie: { toString: () => "", set: cookieSetter } })
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => {
        if (key === "posint-auth") return JSON.stringify({ state: { accessToken: "old-token", refreshToken: "valid-refresh" } })
        return null
      }),
      setItem: vi.fn(),
    })

    const { apiGet } = await import("@/shared/lib/api")
    const result = await apiGet("/secure-data")
    expect(result).toEqual({ id: "1" })
  })
})
