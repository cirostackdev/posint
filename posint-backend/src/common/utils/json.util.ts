/**
 * Safely serialize an object for JSON storage (e.g. Prisma Json columns).
 * Converts BigInt → string and drops undefined values.
 */
export function toJsonSafe(obj: unknown): Record<string, unknown> | null {
  if (obj === null || obj === undefined) return null
  return JSON.parse(
    JSON.stringify(obj, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    ),
  )
}
