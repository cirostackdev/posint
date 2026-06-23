export function generateSlug(name: string): string {
  const honorifics = [
    'alhaji', 'alhaja', 'chief', 'dr', 'prof', 'sir', 'hon',
    'rt. hon', 'senator', 'governor', 'engr', 'arc', 'barrister', 'barr',
  ]

  let normalized = name.toLowerCase().trim()
  for (const prefix of honorifics) {
    normalized = normalized.replace(new RegExp(`^${prefix}\\.?\\s+`, 'i'), '')
  }

  return normalized
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
