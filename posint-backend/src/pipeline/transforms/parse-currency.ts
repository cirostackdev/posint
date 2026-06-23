/**
 * Parse Nigerian currency strings to kobo (bigint-safe number)
 * Handles: "₦2.5bn", "N500m", "NGN 2,000,000", "2.5 billion naira"
 */
export function parseNairaToBigInt(raw: string): bigint {
  if (!raw) return BigInt(0)

  const normalized = raw
    .toLowerCase()
    .replace(/ngn|naira|[₦n]/g, '')
    .replace(/,/g, '')
    .trim()

  let value = 0

  if (normalized.includes('t') || normalized.includes('trillion')) {
    value = parseFloat(normalized) * 1_000_000_000_000
  } else if (normalized.includes('b')) {
    value = parseFloat(normalized) * 1_000_000_000
  } else if (normalized.includes('m')) {
    value = parseFloat(normalized) * 1_000_000
  } else if (normalized.includes('k')) {
    value = parseFloat(normalized) * 1_000
  } else {
    value = parseFloat(normalized) || 0
  }

  return BigInt(Math.round(value * 100))
}
