import { applyDecorators } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'

/**
 * Rate limits auth endpoints more aggressively than general API.
 * Login: 5 attempts per minute per IP
 * Signup: 3 attempts per minute per IP
 * Refresh: 10 attempts per minute per IP
 */
export function ThrottleLogin() {
  return applyDecorators(
    Throttle({ short: { ttl: 60000, limit: 5 } }),
  )
}

export function ThrottleSignup() {
  return applyDecorators(
    Throttle({ short: { ttl: 60000, limit: 3 } }),
  )
}

export function ThrottleRefresh() {
  return applyDecorators(
    Throttle({ short: { ttl: 60000, limit: 10 } }),
  )
}
