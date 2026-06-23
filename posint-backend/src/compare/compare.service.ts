import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { createHash } from 'crypto'

@Injectable()
export class CompareService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async getMetrics(ids: string[]) {
    if (ids.length < 2 || ids.length > 4) {
      throw new BadRequestException('Select between 2 and 4 politicians to compare')
    }
    const hash = createHash('md5').update(ids.sort().join(',')).digest('hex')
    return this.redis.getOrSet(`compare:${hash}`, async () => {
      const politicians = await this.prisma.politician.findMany({
        where: { id: { in: ids }, isActive: true },
        include: {
          party: { select: { abbreviation: true, color: true } },
          votingRecords: { take: 20, orderBy: { sessionDate: 'desc' } },
          sponsoredBills: { take: 10, orderBy: { dateIntroduced: 'desc' } },
          assetDeclarations: { orderBy: { yearDeclared: 'desc' } },
          defections: {
            include: {
              fromParty: { select: { abbreviation: true } },
              toParty: { select: { abbreviation: true } },
            },
          },
          socialStats: true,
        },
      })
      return { politicians }
    }, 300)
  }
}
