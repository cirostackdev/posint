/**
 * Build the CORS origin callback from environment.
 * Extracted for testability — both main.ts and e2e tests import this.
 */
export function buildCorsOrigins(frontendUrl: string, nodeEnv: string): string[] {
  const origins = [frontendUrl]
  if (nodeEnv !== 'production') {
    origins.push('http://localhost:3000', 'http://localhost:3001')
  }
  return origins
}

export function corsOriginCallback(
  allowedOrigins: string[],
): (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void {
  return (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`))
    }
  }
}
