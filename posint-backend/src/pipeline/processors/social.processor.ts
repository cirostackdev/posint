import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job, Queue } from 'bullmq'
import { PrismaService } from '../../prisma/prisma.service'
import { PusherService } from '../../pusher/pusher.service'
import { QUEUE_NAMES } from '../pipeline.constants'

@Processor(QUEUE_NAMES.FETCH_SOCIAL, { concurrency: 2 })
export class SocialProcessor extends WorkerHost {
  private readonly logger = new Logger(SocialProcessor.name)

  constructor(
    private prisma: PrismaService,
    private pusher: PusherService,
    @InjectQueue(QUEUE_NAMES.COMPUTE_SENTIMENT) private sentimentQueue: Queue,
  ) {
    super()
  }

  async process(job: Job) {
    this.logger.log(`Processing social media fetch job ${job.id}`)
    // Twitter API integration would go here
    // For now, log and return — Twitter Bearer Token required
    this.logger.log('Social media fetch: Twitter API credentials required')
    await this.pusher.onPipelineJobComplete({ jobType: 'social', recordsProcessed: 0 })

    // Trigger sentiment computation for newly fetched social data
    try {
      await this.sentimentQueue.add(
        'compute',
        { triggeredBy: 'social' },
        { delay: 2000, jobId: `sentiment-after-social-${Date.now()}` }
      )
    } catch { /* Queue trigger failure is non-critical */ }

    return { processed: 0 }
  }
}
