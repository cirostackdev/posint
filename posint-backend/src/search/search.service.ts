import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { createHash } from 'crypto'

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async globalSearch(query: string, limit = 10) {
    if (!query || query.trim().length < 2) return []
    const hash = createHash('md5').update(query.trim() + limit).digest('hex')
    return this.redis.getOrSet(`search:${hash}`, async () => {
      const term = query.trim()
      const [politicians, bills, cases, elections] = await Promise.all([
        this.prisma.politician.findMany({
          where: { isActive: true, OR: [{ name: { contains: term, mode: 'insensitive' } }, { constituency: { contains: term, mode: 'insensitive' } }, { state: { contains: term, mode: 'insensitive' } }] },
          select: { id: true, slug: true, name: true, position: true, state: true },
          take: limit,
        }),
        this.prisma.sponsoredBill.findMany({
          where: { OR: [{ title: { contains: term, mode: 'insensitive' } }, { summary: { contains: term, mode: 'insensitive' } }] },
          select: { id: true, title: true, status: true, chamber: true },
          take: Math.floor(limit / 2),
        }),
        this.prisma.corruptionCase.findMany({
          where: { isActive: true, OR: [{ politicianName: { contains: term, mode: 'insensitive' } }, { description: { contains: term, mode: 'insensitive' } }] },
          select: { id: true, politicianName: true, agency: true, status: true },
          take: Math.floor(limit / 2),
        }),
        this.prisma.election.findMany({
          where: { OR: [{ winnerName: { contains: term, mode: 'insensitive' } }, { type: { contains: term, mode: 'insensitive' } }, { state: { contains: term, mode: 'insensitive' } }] },
          select: { id: true, type: true, year: true, winnerName: true, state: true },
          take: Math.floor(limit / 2),
        }),
      ])
      return [
        ...politicians.map(p => ({ entityType: 'politician', entityId: p.id, slug: p.slug, title: p.name, subtitle: `${p.position} — ${p.state}` })),
        ...bills.map(b => ({ entityType: 'bill', entityId: b.id, title: b.title, subtitle: `${b.status} — ${b.chamber}` })),
        ...cases.map(c => ({ entityType: 'case', entityId: c.id, title: c.politicianName, subtitle: `${c.agency} — ${c.status}` })),
        ...elections.map(e => ({ entityType: 'election', entityId: e.id, title: `${e.type} (${e.year})`, subtitle: `${e.winnerName}${e.state ? ` — ${e.state}` : ' — Federal'}` })),
      ]
    }, 120)
  }
}
