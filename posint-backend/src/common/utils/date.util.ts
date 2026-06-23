/**
 * Parse various Nigerian date formats to Date
 */
export function parseDate(raw: string): Date | null {
  if (!raw) return null

  // Handle "15th March 2024" or "15 March 2024"
  const withOrdinal = raw.replace(/(\d+)(st|nd|rd|th)/, '$1')

  const date = new Date(withOrdinal)
  return isNaN(date.getTime()) ? null : date
}
