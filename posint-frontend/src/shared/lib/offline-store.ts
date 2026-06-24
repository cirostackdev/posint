import { get, set, del, keys, clear } from "idb-keyval"

const CACHE_PREFIX = "posint_"
const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 hours

interface CachedItem<T> {
  data: T
  timestamp: number
  key: string
}

/**
 * Store data in IndexedDB with TTL
 */
export async function cacheSet<T>(key: string, data: T): Promise<void> {
  const item: CachedItem<T> = {
    data,
    timestamp: Date.now(),
    key: `${CACHE_PREFIX}${key}`,
  }
  await set(`${CACHE_PREFIX}${key}`, item)
}

/**
 * Retrieve data from IndexedDB (returns null if expired or missing)
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const item = await get<CachedItem<T>>(`${CACHE_PREFIX}${key}`)
    if (!item) return null
    if (Date.now() - item.timestamp > CACHE_TTL) {
      await del(`${CACHE_PREFIX}${key}`)
      return null
    }
    return item.data
  } catch {
    return null
  }
}

/**
 * Remove a specific cache entry
 */
export async function cacheRemove(key: string): Promise<void> {
  await del(`${CACHE_PREFIX}${key}`)
}

/**
 * Store last-viewed politician profiles (max 20)
 */
export async function cacheRecentProfile(slug: string, profile: unknown): Promise<void> {
  const recentKey = `${CACHE_PREFIX}recent_profiles`
  const existing = (await get<string[]>(recentKey)) ?? []
  const updated = [slug, ...existing.filter((s) => s !== slug)].slice(0, 20)
  await set(recentKey, updated)
  await cacheSet(`profile_${slug}`, profile)
}

/**
 * Get list of recently viewed profile slugs
 */
export async function getRecentProfiles(): Promise<string[]> {
  return (await get<string[]>(`${CACHE_PREFIX}recent_profiles`)) ?? []
}

/**
 * Cache search results for offline access
 */
export async function cacheSearchResults(query: string, results: unknown): Promise<void> {
  await cacheSet(`search_${query.toLowerCase().trim()}`, results)
}

/**
 * Retrieve cached search results
 */
export async function getCachedSearchResults<T>(query: string): Promise<T | null> {
  return cacheGet<T>(`search_${query.toLowerCase().trim()}`)
}

/**
 * Store watchlist for offline viewing
 */
export async function cacheWatchlist(items: unknown[]): Promise<void> {
  await set(`${CACHE_PREFIX}watchlist`, { data: items, timestamp: Date.now() })
}

/**
 * Get cached watchlist
 */
export async function getCachedWatchlist<T>(): Promise<T[] | null> {
  const result = await get<{ data: T[]; timestamp: number }>(`${CACHE_PREFIX}watchlist`)
  return result?.data ?? null
}

/**
 * Queue a failed mutation for background sync retry
 */
export async function queueMutation(mutation: {
  url: string
  method: string
  body: unknown
  timestamp: number
}): Promise<void> {
  const queueKey = `${CACHE_PREFIX}mutation_queue`
  const queue = (await get<typeof mutation[]>(queueKey)) ?? []
  queue.push(mutation)
  await set(queueKey, queue)
}

/**
 * Get all queued mutations
 */
export async function getQueuedMutations(): Promise<Array<{
  url: string
  method: string
  body: unknown
  timestamp: number
}>> {
  return (await get(`${CACHE_PREFIX}mutation_queue`)) ?? []
}

/**
 * Clear mutation queue after successful sync
 */
export async function clearMutationQueue(): Promise<void> {
  await del(`${CACHE_PREFIX}mutation_queue`)
}

/**
 * Clear all POSINT cache data
 */
export async function clearAllCache(): Promise<void> {
  const allKeys = await keys()
  const posintKeys = allKeys.filter((k) => String(k).startsWith(CACHE_PREFIX))
  await Promise.all(posintKeys.map((k) => del(k)))
}
