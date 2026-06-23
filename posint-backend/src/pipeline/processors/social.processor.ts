import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { PrismaService } from '../../prisma/prisma.service'
import { PusherService } from '../../pusher/pusher.service'
import { QUEUE_NAMES } from '../pipeline.constants'

@Processor(QUEUE_NAMES.FETCH_SOCIAL, { concurrency: 2 })
export class SocialProcessor extends WorkerHost {
  private readonly logger = new Logger(SocialProcessor.name)

  constructor(
    private prisma: PrismaService,
    private pusher: PusherService,
  ) {
    super()
  }

  async process(job: Job) {
    this.logger.log(`Processing social media fetch job ${job.id}`)
    // Twitter API integration would go here
    // For now, log and return — Twitter Bearer Token required
    this.logger.log('Social media fetch: Twitter API credentials required')
    await this.pusher.onPipelineJobComplete({ jobType: 'social', recordsProcessed: 0 })
    return { processed: 0 }
  }
}
