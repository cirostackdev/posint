import { describe, it, expect, beforeEach } from "vitest"
import {
  cacheSet,
  cacheGet,
  cacheRemove,
  cacheRecentProfile,
  getRecentProfiles,
  queueMutation,
  getQueuedMutations,
  clearMutationQueue,
  cacheSearchResults,
  getCachedSearchResults,
  cacheWatchlist,
  getCachedWatchlist,
  clearAllCache,
} from "@/shared/lib/offline-store"
import { clear } from "idb-keyval"

describe("Offline Store", () => {
  beforeEach(async () => { await clear() })

  describe("cacheSet / cacheGet", () => {
    it("stores and retrieves data", async () => {
      await cacheSet("test-key", { name: "Tinubu", party: "APC" })
      const result = await cacheGet<{ name: string; party: string }>("test-key")
      expect(result).toEqual({ name: "Tinubu", party: "APC" })
    })

    it("returns null for missing keys", async () => {
      const result = await cacheGet("nonexistent")
      expect(result).toBeNull()
    })
  })

  describe("cacheRemove", () => {
    it("removes cached data", async () => {
      await cacheSet("removable", "data")
      await cacheRemove("removable")
      const result = await cacheGet("removable")
      expect(result).toBeNull()
    })
  })

  describe("cacheRecentProfile", () => {
    it("stores recent profiles (max 20)", async () => {
      for (let i = 0; i < 25; i++) {
        await cacheRecentProfile(`politician-${i}`, { name: `Politician ${i}` })
      }
      const recent = await getRecentProfiles()
      expect(recent.length).toBeLessThanOrEqual(20)
    })

    it("deduplicates profile slugs", async () => {
      await cacheRecentProfile("tinubu", { name: "Tinubu" })
      await cacheRecentProfile("atiku", { name: "Atiku" })
      await cacheRecentProfile("tinubu", { name: "Tinubu updated" })
      const recent = await getRecentProfiles()
      expect(recent.filter((s) => s === "tinubu").length).toBe(1)
      expect(recent[0]).toBe("tinubu")
    })
  })

  describe("Mutation Queue", () => {
    it("queues failed mutations for retry", async () => {
      await queueMutation({ url: "/api/v1/test", method: "POST", body: { title: "New case" }, timestamp: Date.now() })
      const queue = await getQueuedMutations()
      expect(queue).toHaveLength(1)
      expect(queue[0].method).toBe("POST")
    })

    it("clears mutation queue", async () => {
      await queueMutation({ url: "/test", method: "POST", body: {}, timestamp: Date.now() })
      await clearMutationQueue()
      const queue = await getQueuedMutations()
      expect(queue).toHaveLength(0)
    })
  })

  describe("Search Results Cache", () => {
    it("stores and retrieves search results", async () => {
      const results = [{ id: "1", name: "Tinubu" }, { id: "2", name: "Atiku" }]
      await cacheSearchResults("tinubu", results)
      const cached = await getCachedSearchResults<typeof results>("tinubu")
      expect(cached).toEqual(results)
    })

    it("normalises query to lowercase", async () => {
      await cacheSearchResults("ATIKU", [{ id: "2" }])
      const cached = await getCachedSearchResults("atiku")
      expect(cached).toBeTruthy()
    })

    it("returns null for uncached queries", async () => {
      const result = await getCachedSearchResults("obi")
      expect(result).toBeNull()
    })
  })

  describe("Watchlist Cache", () => {
    it("stores and retrieves watchlist", async () => {
      const items = [{ id: "pol-1" }, { id: "pol-2" }]
      await cacheWatchlist(items)
      const cached = await getCachedWatchlist()
      expect(cached).toEqual(items)
    })

    it("returns null when no watchlist cached", async () => {
      const cached = await getCachedWatchlist()
      expect(cached).toBeNull()
    })
  })

  describe("clearAllCache", () => {
    it("removes all posint-prefixed cache entries", async () => {
      await cacheSet("item-a", "value-a")
      await cacheSet("item-b", "value-b")
      await clearAllCache()
      expect(await cacheGet("item-a")).toBeNull()
      expect(await cacheGet("item-b")).toBeNull()
    })
  })
})
