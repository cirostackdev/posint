import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { AdminQueryDto } from './dto/admin-query.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async getPlatformStats() {
    const cached = await this.redis.get<any>('stats:platform')
    if (cached) return cached

    const [politicians, parties, elections, bills, billsPassed, cases, activeCases, recovered,
           constituencyProjects, partyDefections, lastSource] = await Promise.all([
      this.prisma.politician.count({ where: { isActive: true } }),
      this.prisma.politicalParty.count({ where: { isActive: true } }),
      this.prisma.election.count(),
      this.prisma.sponsoredBill.count(),
      this.prisma.sponsoredBill.count({ where: { status: 'PASSED' } }),
      this.prisma.corruptionCase.count({ where: { isActive: true } }),
      this.prisma.corruptionCase.count({ where: { isActive: true, status: { in: ['UNDER_INVESTIGATION','ONGOING'] } } }),
      this.prisma.corruptionCase.aggregate({ _sum: { amountRecoveredKobo: true } }),
      this.prisma.constituencyProject.count(),
      this.prisma.partyDefection.count(),
      this.prisma.dataSource.findFirst({
        where: { lastSuccessAt: { not: null } },
        orderBy: { lastSuccessAt: 'desc' },
        select: { lastSuccessAt: true },
      }),
    ])
    return {
      politicians, parties, elections, bills, billsPassed, cases, activeCases,
      totalRecoveredKobo: recovered._sum.amountRecoveredKobo?.toString() ?? '0',
      constituencyProjects,
      partyDefections,
      activePipelineJobs: 0,
      lastSyncAt: lastSource?.lastSuccessAt?.toISOString() ?? null,
    }
  }

  async getUsers(query: AdminQueryDto) {
    const where: Prisma.UserWhereInput = {
      ...(query.search && { OR: [{ email: { contains: query.search, mode: 'insensitive' } }, { displayName: { contains: query.search, mode: 'insensitive' } }] }),
      ...(query.role && { role: query.role as any }),
    }
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({ where, skip: query.skip, take: query.limit, orderBy: { createdAt: 'desc' }, select: { id: true, email: true, displayName: true, role: true, isActive: true, createdAt: true, lastLoginAt: true } }),
      this.prisma.user.count({ where }),
    ])
    return { data: items, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } }
  }

  async updateUserRole(id: string, role: string, adminUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    const updated = await this.prisma.user.update({ where: { id }, data: { role: role as any } })
    await this.prisma.auditLog.create({ data: { tableName: 'users', recordId: id, action: 'UPDATE', oldValues: { role: user.role }, newValues: { role }, changedBy: adminUserId } })
    return updated
  }

  async deactivateUser(id: string, adminUserId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException('User not found')
    await this.prisma.user.update({ where: { id }, data: { isActive: false } })
    await this.prisma.auditLog.create({ data: { tableName: 'users', recordId: id, action: 'UPDATE', oldValues: { isActive: true }, newValues: { isActive: false }, changedBy: adminUserId } })
  }

  async getDataSources() {
    return this.prisma.dataSource.findMany({ orderBy: { name: 'asc' } })
  }

  async getAuditLog(query: AdminQueryDto) {
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({ skip: query.skip, take: query.limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.auditLog.count(),
    ])
    return { data: items, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } }
  }
}
