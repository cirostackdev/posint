import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { PrismaService } from '../../prisma/prisma.service'
import { RedisService } from '../../redis/redis.service'
import { PusherService } from '../../pusher/pusher.service'
import { QUEUE_NAMES } from '../pipeline.constants'

@Processor(QUEUE_NAMES.COMPUTE_STATS, { concurrency: 1 })
export class StatsProcessor extends WorkerHost {
  private readonly logger = new Logger(StatsProcessor.name)

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private pusher: PusherService,
  ) {
    super()
  }

  async process(job: Job) {
    this.logger.log('Recomputing platform stats')

    const [
      totalPoliticians, totalParties, totalElections, totalBills,
      billsPassed, totalCases, activeCases, totalRecoveredResult,
    ] = await Promise.all([
      this.prisma.politician.count({ where: { isActive: true } }),
      this.prisma.politicalParty.count({ where: { isActive: true } }),
      this.prisma.election.count(),
      this.prisma.sponsoredBill.count(),
      this.prisma.sponsoredBill.count({ where: { status: 'PASSED' } }),
      this.prisma.corruptionCase.count({ where: { isActive: true } }),
      this.prisma.corruptionCase.count({ where: { isActive: true, status: { in: ['UNDER_INVESTIGATION', 'ONGOING'] } } }),
      this.prisma.corruptionCase.aggregate({ _sum: { amountRecoveredKobo: true } }),
    ])

    const stats = {
      totalPoliticians, totalParties, totalElections, totalBills, billsPassed,
      totalCases, activeCases,
      totalRecoveredKobo: totalRecoveredResult._sum.amountRecoveredKobo?.toString() ?? '0',
      computedAt: new Date().toISOString(),
    }

    await this.redis.set('stats:platform', stats, 900)
    await this.pusher.onStatsUpdated(stats)

    this.logger.log(`Stats computed: ${totalPoliticians} politicians, ${totalCases} cases`)
    return stats
  }
}
