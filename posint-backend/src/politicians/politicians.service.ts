import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { PusherService } from '../pusher/pusher.service'
import { QueryPoliticiansDto } from './dto/query-politicians.dto'
import { CreatePoliticianDto } from './dto/create-politician.dto'
import { UpdatePoliticianDto } from './dto/update-politician.dto'
import { toJsonSafe } from "../common/utils/json.util"
import { generateSlug } from '../common/utils/slug.util'

@Injectable()
export class PoliticiansService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private pusher: PusherService,
  ) {}

  async findAll(query: QueryPoliticiansDto) {
    const cacheKey = `politicians:list:${JSON.stringify(query)}`

    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const where: Prisma.PoliticianWhereInput = {
          isActive: true,
          ...(query.state && { state: query.state }),
          ...(query.chamber && { chamber: query.chamber as any }),
          ...(query.party && { party: { abbreviation: query.party } }),
          ...(query.search && {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { constituency: { contains: query.search, mode: 'insensitive' } },
              { state: { contains: query.search, mode: 'insensitive' } },
              { position: { contains: query.search, mode: 'insensitive' } },
            ],
          }),
        }

        const [items, total] = await Promise.all([
          this.prisma.politician.findMany({
            where,
            skip: query.skip,
            take: query.limit,
            orderBy: { [query.sortBy || 'name']: query.sortOrder },
            include: { party: { select: { abbreviation: true, color: true } } },
          }),
          this.prisma.politician.count({ where }),
        ])

        return {
          data: items.map(this.mapToListResponse),
          meta: {
            page: query.page,
            limit: query.limit,
            total,
            totalPages: Math.ceil(total / query.limit),
          },
        }
      },
      300,
    )
  }

  async findBySlug(slug: string) {
    const cacheKey = `politicians:slug:${slug}`

    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const politician = await this.prisma.politician.findFirst({
          where: { slug, isActive: true },
          include: {
            party: true,
            contacts: true,
            votingRecords: { orderBy: { sessionDate: 'desc' }, take: 50 },
            sponsoredBills: {
              orderBy: { dateIntroduced: 'desc' },
              include: { readings: true },
            },
            assetDeclarations: { orderBy: { yearDeclared: 'desc' } },
            constituencyProjects: { orderBy: { year: 'desc' } },
            defections: {
              include: {
                fromParty: { select: { abbreviation: true, color: true } },
                toParty: { select: { abbreviation: true, color: true } },
              },
              orderBy: { defectionDate: 'desc' },
            },
            careerEvents: { orderBy: { year: 'desc' } },
            committees: { orderBy: { startDate: 'desc' } },
            socialStats: true,
          },
        })

        if (!politician) throw new NotFoundException('Politician not found')

        const corruptionCases = await this.prisma.corruptionCase.count({
          where: { politicianId: politician.id, isActive: true },
        })

        const { contacts, ...safeFields } = politician
        return { ...safeFields, corruptionCases }
      },
      3600,
    )
  }

  async getVotingRecords(slug: string) {
    const politician = await this.prisma.politician.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    })
    if (!politician) throw new NotFoundException('Politician not found')

    return this.prisma.votingRecord.findMany({
      where: { politicianId: politician.id },
      orderBy: { sessionDate: 'desc' },
    })
  }

  async getBills(slug: string) {
    const politician = await this.prisma.politician.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    })
    if (!politician) throw new NotFoundException('Politician not found')

    return this.prisma.sponsoredBill.findMany({
      where: { politicianId: politician.id },
      orderBy: { dateIntroduced: 'desc' },
      include: { readings: true },
    })
  }

  async getAssets(slug: string) {
    const politician = await this.prisma.politician.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    })
    if (!politician) throw new NotFoundException('Politician not found')

    return this.prisma.assetDeclaration.findMany({
      where: { politicianId: politician.id },
      orderBy: { yearDeclared: 'desc' },
    })
  }

  async getProjects(slug: string) {
    const politician = await this.prisma.politician.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    })
    if (!politician) throw new NotFoundException('Politician not found')

    return this.prisma.constituencyProject.findMany({
      where: { politicianId: politician.id },
      orderBy: { year: 'desc' },
    })
  }

  async getDefections(slug: string) {
    const politician = await this.prisma.politician.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    })
    if (!politician) throw new NotFoundException('Politician not found')

    return this.prisma.partyDefection.findMany({
      where: { politicianId: politician.id },
      include: {
        fromParty: { select: { abbreviation: true, color: true } },
        toParty: { select: { abbreviation: true, color: true } },
      },
      orderBy: { defectionDate: 'desc' },
    })
  }

  async getCareer(slug: string) {
    const politician = await this.prisma.politician.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    })
    if (!politician) throw new NotFoundException('Politician not found')

    return this.prisma.careerEvent.findMany({
      where: { politicianId: politician.id },
      orderBy: { year: 'desc' },
    })
  }

  async getCommittees(slug: string) {
    const politician = await this.prisma.politician.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    })
    if (!politician) throw new NotFoundException('Politician not found')

    return this.prisma.committeeAssignment.findMany({
      where: { politicianId: politician.id },
      orderBy: { startDate: 'desc' },
    })
  }

  async getSocial(slug: string) {
    const politician = await this.prisma.politician.findFirst({
      where: { slug, isActive: true },
      select: { id: true },
    })
    if (!politician) throw new NotFoundException('Politician not found')

    const [posts, stats] = await Promise.all([
      this.prisma.socialMention.findMany({
        where: { politicianId: politician.id },
        orderBy: { publishedAt: 'desc' },
        take: 20,
      }),
      this.prisma.politicianSocialStats.findUnique({
        where: { politicianId: politician.id },
      }),
    ])

    return { posts, stats }
  }

  async getStats() {
    return this.redis.getOrSet(
      'politicians:stats',
      async () => {
        const [total, byChamber, byState] = await Promise.all([
          this.prisma.politician.count({ where: { isActive: true } }),
          this.prisma.politician.groupBy({
            by: ['chamber'],
            where: { isActive: true },
            _count: { _all: true },
          }),
          this.prisma.politician.groupBy({
            by: ['state'],
            where: { isActive: true },
            _count: { _all: true },
            orderBy: { _count: { state: 'desc' } },
            take: 10,
          }),
        ])
        return { total, byChamber, byState }
      },
      900,
    )
  }

  async create(dto: CreatePoliticianDto, adminUserId: string) {
    const slug = generateSlug(dto.name)

    const politician = await this.prisma.politician.create({
      data: { ...dto, slug } as any,
    })

    await this.writeAuditLog('politicians', politician.id, 'INSERT', null, politician, adminUserId)
    await this.redis.del('politicians:stats', 'stats:platform')
    await this.pusher.onPoliticianCreated({ id: politician.id, slug })

    return politician
  }

  async update(id: string, dto: UpdatePoliticianDto, adminUserId: string) {
    const existing = await this.prisma.politician.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Politician not found')

    const updated = await this.prisma.politician.update({
      where: { id },
      data: dto as any,
    })

    await this.writeAuditLog('politicians', id, 'UPDATE', existing, updated, adminUserId)
    await this.redis.del('politicians:stats', 'stats:platform')
    await this.pusher.onPoliticianUpdated({ id, slug: updated.slug })

    return updated
  }

  async remove(id: string, adminUserId: string) {
    const existing = await this.prisma.politician.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Politician not found')

    await this.prisma.politician.update({ where: { id }, data: { isActive: false } })
    await this.writeAuditLog('politicians', id, 'DELETE', existing, null, adminUserId)
    await this.redis.del('politicians:stats', 'stats:platform')
  }

  private async writeAuditLog(
    table: string,
    recordId: string,
    action: string,
    oldValues: unknown,
    newValues: unknown,
    changedBy: string,
  ) {
    await this.prisma.auditLog.create({
      data: { tableName: table, recordId, action, oldValues: toJsonSafe(oldValues) as any, newValues: toJsonSafe(newValues) as any, changedBy },
    })
  }

  private mapToListResponse(p: any) {
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      party: p.party?.abbreviation ?? 'Independent',
      partyColor: p.party?.color ?? '#6B7280',
      position: p.position,
      chamber: p.chamber,
      constituency: p.constituency,
      state: p.state,
      photoUrl: p.photoUrl,
      billsSponsored: p.billsSponsored,
      attendanceRate: Number(p.attendanceRate),
      yearsInOffice: p.yearsInOffice,
    }
  }
}
