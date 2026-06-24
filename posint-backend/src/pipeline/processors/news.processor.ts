import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { PrismaService } from '../../prisma/prisma.service'
import { ProvenanceService } from '../../provenance/provenance.service'
import { NewsRssScraper } from '../scrapers/news-rss.scraper'
import { QUEUE_NAMES } from '../pipeline.constants'

@Processor(QUEUE_NAMES.FETCH_NEWS, { concurrency: 1 })
export class NewsProcessor extends WorkerHost {
  private readonly logger = new Logger(NewsProcessor.name)

  constructor(
    private prisma: PrismaService,
    private provenance: ProvenanceService,
    private newsScraper: NewsRssScraper,
  ) {
    super()
  }

  async process(job: Job) {
    this.logger.log('Fetching Nigerian political news...')
    const items = await this.newsScraper.scrape()
    let matched = 0

    for (const item of items) {
      const politicians = await this.findMentionedPoliticians(item.title + ' ' + item.content)

      for (const politician of politicians) {
        await this.prisma.socialMention.create({
          data: {
            politicianId: politician.id,
            platform: 'TWITTER', // Using TWITTER as closest enum until NEWS is added
            content: `[${item.source}] ${item.title}`,
            url: item.link,
            publishedAt: item.publishedAt,
            sentiment: 'NEUTRAL',
            engagementTotal: 0,
            likes: 0,
            shares: 0,
            comments: 0,
            isByPolitician: false,
          },
        })

        await this.provenance.linkFact({
          entityType: 'social_mention',
          entityId: politician.id,
          sourceRecordId: item.sourceRecordId,
          extractionMethod: 'rss_name_match',
          extractedText: item.title,
          confidence: 0.65,
        })

        matched++
      }
    }

    this.logger.log(`News: ${items.length} articles, ${matched} politician matches`)
    return { articlesScraped: items.length, politicianMatches: matched }
  }

  private async findMentionedPoliticians(text: string) {
    const politicians = await this.prisma.politician.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    })

    return politicians.filter(p => {
      const surname = p.name.split(' ').at(-1) ?? ''
      return surname.length > 3 && text.includes(surname)
    })
  }
}
