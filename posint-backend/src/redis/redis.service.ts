import { Injectable, Inject, Logger, Optional } from '@nestjs/common'

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name)

  constructor(@Optional() @Inject('REDIS_CLIENT') private readonly redis: any) {
    if (!redis) {
      this.logger.warn('Redis client not configured — caching disabled')
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null
    try {
      return await this.redis.get(key) as T | null
    } catch (err) {
      this.logger.error(`Redis GET error [${key}]:`, err)
      return null
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (!this.redis) return
    try {
      if (ttlSeconds) {
        await this.redis.set(key, value, { ex: ttlSeconds })
      } else {
        await this.redis.set(key, value)
      }
    } catch (err) {
      this.logger.error(`Redis SET error [${key}]:`, err)
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis) return
    try {
      await this.redis.del(key)
    } catch (err) {
      this.logger.error(`Redis DEL error [${key}]:`, err)
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.redis) return
    try {
      let cursor = 0
      do {
        const result = await this.redis.scan(cursor, { match: pattern, count: 100 })
        cursor = parseInt(result[0])
        const keys = result[1]
        if (keys && keys.length > 0) {
          await this.redis.del(...keys)
        }
      } while (cursor !== 0)
    } catch (err) {
      this.logger.error(`Redis DEL PATTERN error [${pattern}]:`, err)
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.redis) return 0
    return this.redis.incr(key)
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    if (!this.redis) return
    await this.redis.expire(key, ttlSeconds)
  }

  async getOrSet<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds = 300): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached

    const fresh = await fetchFn()
    await this.set(key, fresh, ttlSeconds)
    return fresh
  }
}
