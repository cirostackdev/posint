import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { PrismaService } from '../../prisma/prisma.service'
import { PusherService } from '../../pusher/pusher.service'
import { EfccScraper } from '../scrapers/efcc.scraper'
import { QUEUE_NAMES } from '../pipeline.constants'

@Processor(QUEUE_NAMES.SCRAPE_EFCC, { concurrency: 1 })
export class EfccProcessor extends WorkerHost {
  private readonly logger = new Logger(EfccProcessor.name)

  constructor(
    private prisma: PrismaService,
    private pusher: PusherService,
    private efccScraper: EfccScraper,
  ) {
    super()
  }

  async process(job: Job) {
    this.logger.log(`Processing EFCC scrape job ${job.id}`)

    try {
      const releases = await this.efccScraper.scrapePresseReleases()
      this.logger.log(`Scraped ${releases.length} EFCC press releases`)

      let processed = 0
      for (const release of releases) {
        const existing = await this.prisma.corruptionCase.findFirst({
          where: {
            politicianName: { contains: release.politicianName, mode: 'insensitive' },
            sourceUrl: release.sourceUrl,
          },
        })

        if (!existing && release.politicianName !== 'Unknown') {
          await this.prisma.corruptionCase.create({
            data: {
              politicianName: release.politicianName,
              agency: 'EFCC',
              charges: release.charges,
              description: release.description,
              status: 'UNDER_INVESTIGATION',
              sourceUrl: release.sourceUrl,
            },
          })
          processed++
        }
      }

      await this.pusher.onPipelineJobComplete({ jobType: 'efcc', recordsProcessed: processed })
      return { processed }
    } catch (err: any) {
      this.logger.error('EFCC scrape failed:', err)
      await this.pusher.onPipelineJobFailed({ jobType: 'efcc', error: err.message })
      throw err
    }
  }
}
