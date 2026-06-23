/**
 * Normalize politician names for deduplication
 * Handles: "Alhaji Bola Ahmed Tinubu" → "bola ahmed tinubu"
 */
export function normalizePoliticianName(name: string): string {
  const honorifics = [
    'alhaji', 'alhaja', 'chief', 'dr', 'dr.', 'prof', 'prof.',
    'sir', 'hon', 'hon.', 'rt. hon', 'senator', 'governor',
    'engr', 'arc', 'barrister', 'barr',
  ]

  let normalized = name.toLowerCase().trim()
  for (const prefix of honorifics) {
    normalized = normalized.replace(new RegExp(`^${prefix}\\.?\\s+`, 'i'), '')
  }
  return normalized.replace(/\s+/g, ' ').trim()
}

export function generateSlug(name: string): string {
  return normalizePoliticianName(name)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
