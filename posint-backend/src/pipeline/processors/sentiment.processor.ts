import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { PrismaService } from '../../prisma/prisma.service'
import { AiService } from '../../services/ai.service'
import { QUEUE_NAMES } from '../pipeline.constants'

@Processor(QUEUE_NAMES.COMPUTE_SENTIMENT, { concurrency: 2 })
export class SentimentProcessor extends WorkerHost {
  private readonly logger = new Logger(SentimentProcessor.name)

  constructor(
    private prisma: PrismaService,
    private ai: AiService,
  ) {
    super()
  }

  async process(job: Job) {
    const mentions = await this.prisma.socialMention.findMany({
      where: {
        sentimentScore: null,
        publishedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      take: 100,
    })

    this.logger.log(`Computing sentiment for ${mentions.length} mentions`)

    for (const mention of mentions) {
      const result = await this.ai.analyzeSentiment(mention.content)
      await this.prisma.socialMention.update({
        where: { id: mention.id },
        data: { sentiment: result.value.label, sentimentScore: result.value.score },
      })
    }

    const politicianIds = [...new Set(mentions.map((m) => m.politicianId))]
    for (const politicianId of politicianIds) {
      await this.recomputeSocialStats(politicianId)
    }

    return { processed: mentions.length }
  }

  private async recomputeSocialStats(politicianId: string) {
    const stats = await this.prisma.socialMention.aggregate({
      where: { politicianId },
      _avg: { sentimentScore: true, engagementTotal: true },
      _count: { _all: true },
    })

    await this.prisma.politicianSocialStats.upsert({
      where: { politicianId },
      create: {
        politicianId,
        overallSentiment: stats._avg.sentimentScore ?? 0,
        totalMentions: stats._count._all,
        engagementRate: stats._avg.engagementTotal ?? 0,
        lastComputedAt: new Date(),
      },
      update: {
        overallSentiment: stats._avg.sentimentScore ?? 0,
        totalMentions: stats._count._all,
        engagementRate: stats._avg.engagementTotal ?? 0,
        lastComputedAt: new Date(),
      },
    })
  }
}
