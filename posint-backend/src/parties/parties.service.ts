import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { CreatePartyDto } from './dto/create-party.dto'

@Injectable()
export class PartiesService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async findAll() {
    return this.redis.getOrSet('parties:list', async () => {
      return this.prisma.politicalParty.findMany({ where: { isActive: true }, orderBy: { seatsTotal: 'desc' } })
    }, 900)
  }

  async getSeatDistribution() {
    return this.redis.getOrSet('parties:seats', async () => {
      const parties = await this.prisma.politicalParty.findMany({ where: { isActive: true }, select: { abbreviation: true, color: true, seatsTotal: true, senateSeats: true, houseSeats: true } })
      const totalSeats = parties.reduce((sum, p) => sum + p.seatsTotal, 0)
      return parties.map(p => ({ ...p, percentage: totalSeats > 0 ? Math.round((p.seatsTotal / totalSeats) * 100) : 0 }))
    }, 900)
  }

  async findBySlug(slug: string) {
    const party = await this.prisma.politicalParty.findUnique({
      where: { slug },
      include: { politicians: { where: { isActive: true }, select: { id: true, slug: true, name: true, position: true, chamber: true, state: true, photoUrl: true }, orderBy: { name: 'asc' } } },
    })
    if (!party) throw new NotFoundException('Party not found')
    return party
  }

  async create(dto: CreatePartyDto, adminUserId: string) {
    const party = await this.prisma.politicalParty.create({ data: dto })
    await this.prisma.auditLog.create({ data: { tableName: 'political_parties', recordId: party.id, action: 'INSERT', newValues: party, changedBy: adminUserId } })
    await this.redis.delPattern('parties:*')
    return party
  }

  async update(id: string, dto: Partial<CreatePartyDto>, adminUserId: string) {
    const existing = await this.prisma.politicalParty.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Party not found')
    const updated = await this.prisma.politicalParty.update({ where: { id }, data: dto })
    await this.prisma.auditLog.create({ data: { tableName: 'political_parties', recordId: id, action: 'UPDATE', oldValues: existing, newValues: updated, changedBy: adminUserId } })
    await this.redis.delPattern('parties:*')
    return updated
  }
}
