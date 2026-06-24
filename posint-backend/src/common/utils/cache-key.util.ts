import { createHash } from 'crypto'

/**
 * Generate a deterministic cache key from a prefix and parameters.
 * Keys are sorted before hashing, so {a:1, b:2} and {b:2, a:1} produce the same key.
 * Null and undefined values are excluded from the hash.
 */
export function cacheKey(prefix: string, params: Record<string, unknown>): string {
  const sorted = Object.keys(params)
    .filter(k => params[k] !== undefined && params[k] !== null)
    .sort()
    .map(k => `${k}=${String(params[k])}`)
    .join('&')
  const hash = createHash('sha256').update(sorted).digest('hex').slice(0, 16)
  return `${prefix}:${hash}`
}
