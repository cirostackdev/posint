import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ProvenanceService } from '../provenance/provenance.service'

interface SubmitCorrectionDto {
  entityType: string
  entityId: string
  fieldName: string
  currentValue: string
  proposedValue: string
  evidence?: string
  submitterName: string
  submitterEmail: string
}

@Injectable()
export class CorrectionsService {
  constructor(private prisma: PrismaService, private provenance: ProvenanceService) {}

  async submit(dto: SubmitCorrectionDto) {
    return this.prisma.correctionRequest.create({ data: dto })
  }

  async listPending(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [items, total] = await Promise.all([
      this.prisma.correctionRequest.findMany({
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.correctionRequest.count({ where: { status: 'pending' } }),
    ])
    return { data: items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } }
  }

  async approve(id: string, reviewerId: string, notes?: string) {
    const request = await this.prisma.correctionRequest.findUnique({ where: { id } })
    if (!request) throw new NotFoundException('Correction request not found')

    await this.provenance.recordChange({
      entityType: request.entityType,
      entityId: request.entityId,
      fieldName: request.fieldName,
      oldValue: request.currentValue,
      newValue: request.proposedValue,
      changeReason: `correction_approved:${id}`,
    })

    return this.prisma.correctionRequest.update({
      where: { id },
      data: { status: 'approved', reviewedBy: reviewerId, reviewedAt: new Date(), reviewNotes: notes },
    })
  }

  async reject(id: string, reviewerId: string, notes: string) {
    return this.prisma.correctionRequest.update({
      where: { id },
      data: { status: 'rejected', reviewedBy: reviewerId, reviewedAt: new Date(), reviewNotes: notes },
    })
  }
}
