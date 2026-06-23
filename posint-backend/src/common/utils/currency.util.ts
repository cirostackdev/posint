/**
 * Format kobo (bigint) to display Naira string
 * 250_000_000_000 kobo → "₦2.5bn"
 */
export function formatKoboToNaira(kobo: bigint | number): string {
  const naira = Number(kobo) / 100

  if (naira >= 1_000_000_000_000) return `₦${(naira / 1_000_000_000_000).toFixed(1)}tn`
  if (naira >= 1_000_000_000) return `₦${(naira / 1_000_000_000).toFixed(1)}bn`
  if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(1)}m`
  if (naira >= 1_000) return `₦${(naira / 1_000).toFixed(1)}k`
  return `₦${naira.toLocaleString('en-NG')}`
}

/**
 * Parse Nigerian currency string to kobo (bigint-safe number)
 * "₦2.5bn" → BigInt(250_000_000_000)
 */
export function parseNairaToBigInt(raw: string): bigint {
  if (!raw) return BigInt(0)

  const normalized = raw
    .toLowerCase()
    .replace(/[₦n]|naira|ngn/g, '')
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
