import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { PusherService } from '../pusher/pusher.service'
import { QueryCasesDto } from './dto/query-cases.dto'
import { CreateCaseDto } from './dto/create-case.dto'
import { UpdateCaseDto } from './dto/update-case.dto'
import { toJsonSafe } from '../common/utils/json.util'

@Injectable()
export class CorruptionService {
  constructor(private prisma: PrismaService, private redis: RedisService, private pusher: PusherService) {}

  async findAll(query: QueryCasesDto) {
    const cacheKey = `corruption:list:${JSON.stringify(query)}`
    return this.redis.getOrSet(cacheKey, async () => {
      const where: Prisma.CorruptionCaseWhereInput = {
        isActive: true,
        ...(query.agency && { agency: query.agency as any }),
        ...(query.status && { status: query.status as any }),
        ...(query.year && { filingDate: { gte: new Date(`${query.year}-01-01`), lt: new Date(`${query.year + 1}-01-01`) } }),
        ...(query.search && { OR: [{ politicianName: { contains: query.search, mode: 'insensitive' } }, { description: { contains: query.search, mode: 'insensitive' } }] }),
      }
      const [items, total] = await Promise.all([
        this.prisma.corruptionCase.findMany({ where, skip: query.skip, take: query.limit, orderBy: { filingDate: 'desc' }, include: { politician: { select: { name: true, slug: true } } } }),
        this.prisma.corruptionCase.count({ where }),
      ])
      return { data: items, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } }
    }, 300)
  }

  async findById(id: string) {
    const case_ = await this.prisma.corruptionCase.findFirst({ where: { id, isActive: true }, include: { politician: true } })
    if (!case_) throw new NotFoundException('Case not found')
    return case_
  }

  async getStats() {
    return this.redis.getOrSet('corruption:stats', async () => {
      const [total, convictions, acquittals, active, recoveredResult] = await Promise.all([
        this.prisma.corruptionCase.count({ where: { isActive: true } }),
        this.prisma.corruptionCase.count({ where: { isActive: true, status: 'CONVICTED' } }),
        this.prisma.corruptionCase.count({ where: { isActive: true, status: 'ACQUITTED' } }),
        this.prisma.corruptionCase.count({ where: { isActive: true, status: { in: ['UNDER_INVESTIGATION', 'ONGOING'] } } }),
        this.prisma.corruptionCase.aggregate({ _sum: { amountRecoveredKobo: true } }),
      ])
      return { total, convictions, acquittals, active, totalRecoveredKobo: recoveredResult._sum.amountRecoveredKobo?.toString() ?? '0' }
    }, 900)
  }

  async create(dto: CreateCaseDto, adminUserId: string) {
    const data: any = { ...dto, status: dto.status as any, agency: dto.agency as any }
    if (dto.filingDate) data.filingDate = new Date(dto.filingDate)
    if (dto.verdictDate) data.verdictDate = new Date(dto.verdictDate)
    const case_ = await this.prisma.corruptionCase.create({ data })
    await this.prisma.auditLog.create({ data: { tableName: 'corruption_cases', recordId: case_.id, action: 'INSERT', newValues: toJsonSafe(case_) as any, changedBy: adminUserId } })
    await this.redis.delPattern('corruption:*')
    return case_
  }

  async update(id: string, dto: UpdateCaseDto, adminUserId: string) {
    const existing = await this.prisma.corruptionCase.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Case not found')
    const data: any = { ...dto }
    if (dto.filingDate) data.filingDate = new Date(dto.filingDate)
    if (dto.verdictDate) data.verdictDate = new Date(dto.verdictDate)
    const updated = await this.prisma.corruptionCase.update({ where: { id }, data })
    if (existing.status !== updated.status) {
      await this.pusher.onCaseStatusChanged({ id, politicianName: updated.politicianName, agency: updated.agency, newStatus: updated.status })
    }
    await this.prisma.auditLog.create({ data: { tableName: 'corruption_cases', recordId: id, action: 'UPDATE', oldValues: toJsonSafe(existing) as any, newValues: toJsonSafe(updated) as any, changedBy: adminUserId } })
    await this.redis.delPattern('corruption:*')
    return updated
  }

  async remove(id: string, adminUserId: string) {
    const existing = await this.prisma.corruptionCase.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Case not found')
    await this.prisma.corruptionCase.update({ where: { id }, data: { isActive: false } })
    await this.prisma.auditLog.create({ data: { tableName: 'corruption_cases', recordId: id, action: 'DELETE', oldValues: toJsonSafe(existing) as any, changedBy: adminUserId } })
    await this.redis.delPattern('corruption:*')
  }
}
