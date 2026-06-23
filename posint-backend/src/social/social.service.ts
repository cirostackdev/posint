import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { QuerySocialDto } from './dto/query-social.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async getPosts(politicianId: string, query: QuerySocialDto) {
    const where: Prisma.SocialMentionWhereInput = {
      politicianId,
      ...(query.platform && { platform: query.platform as any }),
      ...(query.from || query.to ? {
        publishedAt: {
          ...(query.from && { gte: new Date(query.from) }),
          ...(query.to && { lte: new Date(query.to) }),
        },
      } : {}),
    }
    return this.prisma.socialMention.findMany({ where, orderBy: { publishedAt: 'desc' }, take: query.limit })
  }

  async getSentiment(politicianId: string) {
    return this.redis.getOrSet(`social:sentiment:${politicianId}`, async () => {
      return this.prisma.socialMention.findMany({
        where: { politicianId, sentimentScore: { not: null } },
        select: { publishedAt: true, sentiment: true, sentimentScore: true },
        orderBy: { publishedAt: 'asc' },
        take: 100,
      })
    }, 600)
  }

  async getTopics(politicianId: string) {
    return this.prisma.topicMention.findMany({
      where: { politicianId },
      orderBy: { mentionCount: 'desc' },
      take: 20,
    })
  }

  async getStats(politicianId: string) {
    return this.redis.getOrSet(`social:stats:${politicianId}`, async () => {
      return this.prisma.politicianSocialStats.findUnique({ where: { politicianId } })
    }, 600)
  }
}
