import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { randomBytes } from 'crypto'

const TIER_LIMITS: Record<string, number> = {
  FREE: 100,
  RESEARCHER: 10000,
  INSTITUTIONAL: -1,
}

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name)

  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async createKey(userId: string, name: string, tier = 'FREE') {
    const key = `posint_${tier.toLowerCase()}_${randomBytes(24).toString('hex')}`
    const dailyLimit = TIER_LIMITS[tier] ?? 100
    return this.prisma.apiKey.create({
      data: { userId, key, name, tier: tier as any, dailyLimit },
    })
  }

  async validateKey(key: string): Promise<{ userId: string; tier: string } | null> {
    const cached = await this.redis.get<{ userId: string; tier: string }>(`apikey:${key}`)
    if (cached) return cached

    const apiKey = await this.prisma.apiKey.findUnique({ where: { key } })
    if (!apiKey || !apiKey.isActive) return null
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null

    const result = { userId: apiKey.userId, tier: apiKey.tier }
    await this.redis.set(`apikey:${key}`, result, 300)
    return result
  }

  async checkRateLimit(key: string, tier: string): Promise<boolean> {
    const limit = TIER_LIMITS[tier]
    if (limit === -1) return true

    const window = tier === 'FREE' ? 'hour' : 'day'
    const now = new Date()
    const windowKey = window === 'hour'
      ? `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`
      : `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
    const redisKey = `ratelimit:${key}:${window}:${windowKey}`

    const count = await this.redis.incr(redisKey)
    if (count === 1) {
      await this.redis.expire(redisKey, window === 'hour' ? 3600 : 86400)
    }

    return count <= limit
  }

  async getUserKeys(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async revokeKey(id: string, userId: string) {
    return this.prisma.apiKey.updateMany({
      where: { id, userId },
      data: { isActive: false },
    })
  }
}
