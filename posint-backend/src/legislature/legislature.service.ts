import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { PusherService } from '../pusher/pusher.service'
import { QueryBillsDto } from './dto/query-bills.dto'
import { CreateBillDto } from './dto/create-bill.dto'
import { UpdateBillDto } from './dto/update-bill.dto'

@Injectable()
export class LegislatureService {
  constructor(private prisma: PrismaService, private redis: RedisService, private pusher: PusherService) {}

  async findAllBills(query: QueryBillsDto) {
    const cacheKey = `legislature:list:${JSON.stringify(query)}`
    return this.redis.getOrSet(cacheKey, async () => {
      const where: Prisma.SponsoredBillWhereInput = {
        ...(query.status && { status: query.status as any }),
        ...(query.chamber && { chamber: query.chamber as any }),
        ...(query.sponsorId && { politicianId: query.sponsorId }),
        ...(query.search && { OR: [{ title: { contains: query.search, mode: 'insensitive' } }, { summary: { contains: query.search, mode: 'insensitive' } }] }),
      }
      const [items, total] = await Promise.all([
        this.prisma.sponsoredBill.findMany({ where, skip: query.skip, take: query.limit, orderBy: { dateIntroduced: 'desc' }, include: { politician: { select: { name: true, slug: true } }, readings: true } }),
        this.prisma.sponsoredBill.count({ where }),
      ])
      return { data: items, meta: { page: query.page, limit: query.limit, total, totalPages: Math.ceil(total / query.limit) } }
    }, 300)
  }

  async findBillById(id: string) {
    const bill = await this.prisma.sponsoredBill.findUnique({ where: { id }, include: { politician: true, readings: { orderBy: { readingNumber: 'asc' } } } })
    if (!bill) throw new NotFoundException('Bill not found')
    return bill
  }

  async getBillStats() {
    return this.redis.getOrSet('legislature:stats', async () => {
      const now = new Date()
      const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
      const [total, passed, rejected, pending, monthlyRaw] = await Promise.all([
        this.prisma.sponsoredBill.count(),
        this.prisma.sponsoredBill.count({ where: { status: 'PASSED' } }),
        this.prisma.sponsoredBill.count({ where: { status: 'REJECTED' } }),
        this.prisma.sponsoredBill.count({ where: { status: { in: ['FIRST_READING','SECOND_READING','THIRD_READING'] } } }),
        this.prisma.$queryRaw<Array<{ month: string; bills: bigint; passed: bigint; rejected: bigint }>>`
          SELECT
            TO_CHAR(date_introduced, 'Mon') AS month,
            COUNT(*) AS bills,
            COUNT(*) FILTER (WHERE status = 'PASSED') AS passed,
            COUNT(*) FILTER (WHERE status = 'REJECTED') AS rejected
          FROM sponsored_bills
          WHERE date_introduced >= ${twelveMonthsAgo}
          GROUP BY DATE_TRUNC('month', date_introduced), TO_CHAR(date_introduced, 'Mon')
          ORDER BY DATE_TRUNC('month', date_introduced) ASC
        `,
      ])
      const byMonth = monthlyRaw.map(r => ({
        month: r.month,
        bills: Number(r.bills),
        passed: Number(r.passed),
        rejected: Number(r.rejected),
      }))
      return { total, passed, rejected, pending, byMonth }
    }, 900)
  }

  async createBill(dto: CreateBillDto, adminUserId: string) {
    const bill = await this.prisma.sponsoredBill.create({ data: { ...dto, dateIntroduced: new Date(dto.dateIntroduced), datePassed: dto.datePassed ? new Date(dto.datePassed) : undefined, status: dto.status as any, chamber: dto.chamber as any } })
    await this.prisma.auditLog.create({ data: { tableName: 'sponsored_bills', recordId: bill.id, action: 'INSERT', newValues: bill, changedBy: adminUserId } })
    await this.redis.del('legislature:stats', 'stats:platform')
    await this.pusher.onNewBillIntroduced({ id: bill.id, title: bill.title, sponsor: bill.politicianId, chamber: bill.chamber })
    return bill
  }

  async updateBill(id: string, dto: UpdateBillDto, adminUserId: string) {
    const existing = await this.prisma.sponsoredBill.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Bill not found')
    const data: any = { ...dto }
    if (dto.dateIntroduced) data.dateIntroduced = new Date(dto.dateIntroduced)
    if (dto.datePassed) data.datePassed = new Date(dto.datePassed)
    const updated = await this.prisma.sponsoredBill.update({ where: { id }, data })
    if (existing.status !== updated.status) {
      await this.pusher.onBillStatusChanged({ id, title: updated.title, oldStatus: existing.status, newStatus: updated.status })
    }
    await this.prisma.auditLog.create({ data: { tableName: 'sponsored_bills', recordId: id, action: 'UPDATE', oldValues: existing, newValues: updated, changedBy: adminUserId } })
    await this.redis.del('legislature:stats', 'stats:platform')
    return updated
  }

  async removeBill(id: string, adminUserId: string) {
    const existing = await this.prisma.sponsoredBill.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Bill not found')
    await this.prisma.sponsoredBill.delete({ where: { id } })
    await this.prisma.auditLog.create({ data: { tableName: 'sponsored_bills', recordId: id, action: 'DELETE', oldValues: existing, changedBy: adminUserId } })
    await this.redis.del('legislature:stats', 'stats:platform')
  }
}
