import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { PrismaService } from '../../prisma/prisma.service'
import { AiService } from '../../services/ai.service'
import { BotDetectionService } from '../../analytics/bot-detection.service'
import { QUEUE_NAMES } from '../pipeline.constants'

@Processor(QUEUE_NAMES.COMPUTE_SENTIMENT, { concurrency: 2 })
export class SentimentProcessor extends WorkerHost {
  private readonly logger = new Logger(SentimentProcessor.name)

  constructor(
    private prisma: PrismaService,
    private ai: AiService,
    private botDetection: BotDetectionService,
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

    let processed = 0
    for (const mention of mentions) {
      const botScore = this.botDetection.scoreMention({
        content: mention.content,
        publishedAt: mention.publishedAt,
        likesCount: mention.likes,
        sharesCount: mention.shares,
        commentsCount: mention.comments,
        accountAgedays: 365,
        similarContentCount: 0,
      })

      // Skip full NLP for high-confidence bots — still neutral-score them
      if (botScore.score > 0.8) {
        await this.prisma.socialMention.update({
          where: { id: mention.id },
          data: { sentiment: 'NEUTRAL', sentimentScore: 0 },
        })
        processed++
        continue
      }

      const result = await this.ai.analyzeSentiment(mention.content)
      // Weight the score by human probability (bots with score 0.5 reduce weight by 50%)
      const weightedScore = result.value.score * this.botDetection.humanWeight(botScore.score)

      await this.prisma.socialMention.update({
        where: { id: mention.id },
        data: {
          sentiment: result.value.label,
          sentimentScore: weightedScore,
        },
      })

      processed++
    }

    const politicianIds = [...new Set(mentions.map(m => m.politicianId))]
    for (const politicianId of politicianIds) {
      await this.recomputeSocialStats(politicianId)
    }

    return { processed, total: mentions.length }
  }

  private async recomputeSocialStats(politicianId: string) {
    const stats = await this.prisma.socialMention.aggregate({
      where: { politicianId, sentimentScore: { not: null } },
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
