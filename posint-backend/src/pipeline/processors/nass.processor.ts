import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { PrismaService } from '../../prisma/prisma.service'
import { PusherService } from '../../pusher/pusher.service'
import { NassPlaywrightScraper, NassScrapedBill } from '../scrapers/nass-playwright.scraper'
import { QUEUE_NAMES } from '../pipeline.constants'

@Processor(QUEUE_NAMES.SCRAPE_NASS, {
  concurrency: 1,
})
export class NassProcessor extends WorkerHost {
  private readonly logger = new Logger(NassProcessor.name)

  constructor(
    private prisma: PrismaService,
    private pusher: PusherService,
    private nassScraper: NassPlaywrightScraper,
  ) {
    super()
  }

  async process(job: Job) {
    this.logger.log(`Processing NASS scrape job ${job.id}`)
    const dataSourceId = await this.getDataSourceId('NASS')

    try {
      if (dataSourceId) {
        await this.prisma.dataSource.update({
          where: { id: dataSourceId },
          data: { lastScrapedAt: new Date(), status: 'active' },
        })
      }

      const bills = await this.nassScraper.scrape()
      this.logger.log(`Scraped ${bills.length} bills from NASS`)

      let processed = 0
      for (const bill of bills) {
        const result = await this.upsertBill(bill)
        if (result) processed++
      }

      if (dataSourceId) {
        await this.prisma.dataSource.update({
          where: { id: dataSourceId },
          data: { lastSuccessAt: new Date(), recordsCount: { increment: processed }, errorCount: 0 },
        })
      }

      await this.pusher.onPipelineJobComplete({ jobType: 'nass', recordsProcessed: processed })
      return { processed }
    } catch (err: any) {
      this.logger.error('NASS scrape failed:', err)
      if (dataSourceId) {
        await this.prisma.dataSource.update({
          where: { id: dataSourceId },
          data: { status: 'error', errorCount: { increment: 1 } },
        })
      }
      await this.pusher.onPipelineJobFailed({ jobType: 'nass', error: err.message })
      throw err
    }
  }

  private async upsertBill(raw: NassScrapedBill): Promise<boolean> {
    const politician = await this.prisma.politician.findFirst({
      where: { name: { contains: raw.sponsorName, mode: 'insensitive' } },
      select: { id: true },
    })

    if (!politician) return false

    const status = this.mapStatus(raw.status)
    const chamber = this.mapChamber(raw.chamber)
    const date = raw.dateIntroduced ? new Date(raw.dateIntroduced) : new Date()
    if (isNaN(date.getTime())) return false

    const existing = await this.prisma.sponsoredBill.findFirst({
      where: { politicianId: politician.id, title: raw.title },
      select: { id: true, status: true },
    })

    if (existing) {
      if (existing.status !== status) {
        await this.prisma.sponsoredBill.update({ where: { id: existing.id }, data: { status } })
        await this.pusher.onBillStatusChanged({ id: existing.id, title: raw.title, oldStatus: existing.status, newStatus: status })
      }
    } else {
      const bill = await this.prisma.sponsoredBill.create({
        data: { politicianId: politician.id, title: raw.title, status, chamber, dateIntroduced: date, sourceUrl: raw.sourceUrl },
      })
      await this.pusher.onNewBillIntroduced({ id: bill.id, title: bill.title, sponsor: raw.sponsorName, chamber: bill.chamber })
    }
    return true
  }

  private mapStatus(raw: string): any {
    const map: Record<string, string> = {
      'First Reading': 'FIRST_READING', 'Second Reading': 'SECOND_READING',
      'Third Reading': 'THIRD_READING', 'Passed': 'PASSED', 'Rejected': 'REJECTED',
    }
    return map[raw] || 'FIRST_READING'
  }

  private mapChamber(raw: string): any {
    return raw?.toLowerCase().includes('senate') ? 'SENATE' : 'HOUSE_OF_REPRESENTATIVES'
  }

  private async getDataSourceId(name: string): Promise<string | null> {
    const source = await this.prisma.dataSource.findFirst({
      where: { name: { contains: name, mode: 'insensitive' } },
    })
    return source?.id ?? null
  }
}
