/**
 * Parse various Nigerian date formats
 */
export function parseNigerianDate(raw: string): Date | null {
  if (!raw) return null
  const withoutOrdinal = raw.replace(/(\d+)(st|nd|rd|th)/i, '$1')
  const date = new Date(withoutOrdinal)
  return isNaN(date.getTime()) ? null : date
}
