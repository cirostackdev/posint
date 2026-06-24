import { Injectable, Logger } from '@nestjs/common'
import { createHash } from 'crypto'
import { PrismaService } from '../prisma/prisma.service'

export interface RecordSourceInput {
  url: string
  content: string
  contentType: 'html' | 'pdf' | 'json' | 'tweet' | 'rss'
  sourceId?: string
  scrapeJobId?: string
  httpStatus?: number
  responseHeaders?: Record<string, string>
}

export interface LinkFactInput {
  entityType: string
  entityId: string
  fieldName?: string
  sourceRecordId: string
  extractionMethod?: string
  extractedText?: string
  confidence?: number
}

export interface RecordChangeInput {
  entityType: string
  entityId: string
  fieldName: string
  oldValue: string | null
  newValue: string
  sourceRecordId?: string
  changeReason?: string
}

@Injectable()
export class ProvenanceService {
  private readonly logger = new Logger(ProvenanceService.name)

  constructor(private prisma: PrismaService) {}

  hashContent(content: string): string {
    return createHash('sha256').update(content).digest('hex')
  }

  async recordSource(input: RecordSourceInput) {
    const contentHash = this.hashContent(input.content)

    const existing = await this.prisma.sourceRecord.findFirst({
      where: { url: input.url, contentHash },
    })

    if (existing) {
      this.logger.debug(`Source unchanged: ${input.url} (hash: ${contentHash.slice(0, 8)})`)
      return existing
    }

    const record = await this.prisma.sourceRecord.create({
      data: {
        url: input.url,
        contentHash,
        contentType: input.contentType,
        rawContent: input.content.length <= 500_000 ? input.content : null,
        sourceId: input.sourceId,
        scrapeJobId: input.scrapeJobId,
        httpStatus: input.httpStatus,
        responseHeaders: input.responseHeaders ?? undefined,
      },
    })

    this.logger.log(`New source recorded: ${input.url} → ${record.id}`)
    return record
  }

  async linkFact(input: LinkFactInput) {
    return this.prisma.factSource.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId,
        fieldName: input.fieldName,
        sourceRecordId: input.sourceRecordId,
        extractionMethod: input.extractionMethod,
        extractedText: input.extractedText,
        confidence: input.confidence,
      },
    })
  }

  async recordChange(input: RecordChangeInput) {
    return this.prisma.factHistory.create({
      data: {
        entityType: input.entityType,
        entityId: input.entityId,
        fieldName: input.fieldName,
        oldValue: input.oldValue,
        newValue: input.newValue,
        sourceRecordId: input.sourceRecordId,
        changeReason: input.changeReason,
      },
    })
  }

  async getEvidence(entityType: string, entityId: string) {
    return this.prisma.factSource.findMany({
      where: { entityType, entityId },
      include: { sourceRecord: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getHistory(entityType: string, entityId: string) {
    return this.prisma.factHistory.findMany({
      where: { entityType, entityId },
      orderBy: { changedAt: 'desc' },
      take: 50,
    })
  }

  async verifySource(sourceRecordId: string): Promise<boolean> {
    const record = await this.prisma.sourceRecord.findUnique({ where: { id: sourceRecordId } })
    if (!record) return false

    try {
      const res = await fetch(record.url, { method: 'HEAD', signal: AbortSignal.timeout(10000) })
      if (res.ok) {
        await this.prisma.sourceRecord.update({
          where: { id: sourceRecordId },
          data: { verifiedAt: new Date(), deadSince: null },
        })
        return true
      }
    } catch { /* URL unreachable */ }

    await this.prisma.sourceRecord.update({
      where: { id: sourceRecordId },
      data: { deadSince: record.deadSince ?? new Date() },
    })
    return false
  }
}
