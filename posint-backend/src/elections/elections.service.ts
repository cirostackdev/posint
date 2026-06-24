import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { PusherService } from '../pusher/pusher.service'
import { QueryElectionsDto } from './dto/query-elections.dto'
import { CreateElectionDto } from './dto/create-election.dto'
import { UpdateElectionDto } from './dto/update-election.dto'
import { cacheKey } from '../common/utils/cache-key.util'

@Injectable()
export class ElectionsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private pusher: PusherService,
  ) {}

  async findAll(query: QueryElectionsDto) {
    const key = cacheKey('elections:list', query as unknown as Record<string, unknown>)
    return this.redis.getOrSet(key, async () => {
      const where: Prisma.ElectionWhereInput = {
        ...(query.level && { level: query.level as any }),
        ...(query.year && { year: query.year }),
        ...(query.state && { state: query.state }),
        ...(query.lga && { lga: query.lga }),
        ...(query.party && { winnerParty: { abbreviation: query.party } }),
        ...(query.search && {
          OR: [
            { winnerName: { contains: query.search, mode: 'insensitive' } },
            { type: { contains: query.search, mode: 'insensitive' } },
            { state: { contains: query.search, mode: 'insensitive' } },
          ],
        }),
      }
      const [items, total] = await Promise.all([
        this.prisma.election.findMany({
          where, skip: query.skip, take: query.limit,
          orderBy: { year: 'desc' },
          include: { winnerParty: { select: { abbreviation: true, color: true } } },
        }),
        this.prisma.election.count({ where }),
      ])
      return { data: items, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } }
    }, 300)
  }

  async findById(id: string) {
    const election = await this.prisma.election.findUnique({
      where: { id },
      include: {
        winnerParty: true,
        candidates: { include: { party: { select: { abbreviation: true, color: true } } }, orderBy: { position: 'asc' } },
      },
    })
    if (!election) throw new NotFoundException('Election not found')
    return election
  }

  async getStats() {
    return this.redis.getOrSet('elections:stats', async () => {
      const [total, byLevel, byYear] = await Promise.all([
        this.prisma.election.count(),
        this.prisma.election.groupBy({ by: ['level'], _count: { _all: true } }),
        this.prisma.election.groupBy({ by: ['year'], _count: { _all: true }, orderBy: { year: 'desc' }, take: 10 }),
      ])
      return { total, byLevel, byYear }
    }, 900)
  }

  async create(dto: CreateElectionDto, adminUserId: string) {
    const election = await this.prisma.election.create({ data: dto as any })
    await this.prisma.auditLog.create({ data: { tableName: 'elections', recordId: election.id, action: 'INSERT', newValues: election, changedBy: adminUserId } })
    await this.redis.del('elections:stats', 'stats:platform')
    await this.pusher.onElectionDeclared({ id: election.id, type: election.type, year: election.year, level: election.level, winnerName: election.winnerName })
    return election
  }

  async update(id: string, dto: UpdateElectionDto, adminUserId: string) {
    const existing = await this.prisma.election.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Election not found')
    const updated = await this.prisma.election.update({ where: { id }, data: dto as any })
    await this.prisma.auditLog.create({ data: { tableName: 'elections', recordId: id, action: 'UPDATE', oldValues: existing, newValues: updated, changedBy: adminUserId } })
    await this.redis.del('elections:stats', 'stats:platform')
    return updated
  }

  async remove(id: string, adminUserId: string) {
    const existing = await this.prisma.election.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Election not found')
    await this.prisma.election.delete({ where: { id } })
    await this.prisma.auditLog.create({ data: { tableName: 'elections', recordId: id, action: 'DELETE', oldValues: existing, changedBy: adminUserId } })
    await this.redis.del('elections:stats', 'stats:platform')
  }
}
