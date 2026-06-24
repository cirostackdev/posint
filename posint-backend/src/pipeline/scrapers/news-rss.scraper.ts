import { Injectable, Logger } from '@nestjs/common'
import Parser from 'rss-parser'
import { ProvenanceService } from '../../provenance/provenance.service'

export interface NewsItem {
  title: string
  link: string
  publishedAt: Date
  content: string
  source: string
  sourceRecordId: string
}

const NIGERIAN_NEWS_FEEDS = [
  { name: 'Premium Times', url: 'https://www.premiumtimesng.com/category/news/political-news/feed' },
  { name: 'Punch', url: 'https://punchng.com/topics/politics/feed/' },
  { name: 'TheCable', url: 'https://www.thecable.ng/category/news/politics/feed' },
  { name: 'Vanguard', url: 'https://www.vanguardngr.com/category/politics/feed/' },
  { name: 'Daily Trust', url: 'https://dailytrust.com/category/politics/feed/' },
]

@Injectable()
export class NewsRssScraper {
  private readonly logger = new Logger(NewsRssScraper.name)
  private readonly parser = new Parser({ timeout: 15000 })

  constructor(private provenance: ProvenanceService) {}

  async scrape(): Promise<NewsItem[]> {
    const results: NewsItem[] = []

    for (const feed of NIGERIAN_NEWS_FEEDS) {
      try {
        const parsed = await this.parser.parseURL(feed.url)

        for (const item of (parsed.items ?? []).slice(0, 20)) {
          if (!item.title || !item.link) continue

          const content = item.contentSnippet ?? item.content ?? item.title
          const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date()

          const sourceRecord = await this.provenance.recordSource({
            url: item.link,
            content: `${item.title}\n\n${content}`,
            contentType: 'rss',
          })

          results.push({
            title: item.title,
            link: item.link,
            publishedAt,
            content: content.slice(0, 2000),
            source: feed.name,
            sourceRecordId: sourceRecord.id,
          })
        }

        this.logger.log(`Fetched ${parsed.items?.length ?? 0} items from ${feed.name}`)
        // Polite delay between feeds
        await new Promise<void>(r => setTimeout(r, 1000 + Math.random() * 2000))
      } catch (err: any) {
        this.logger.warn(`Failed to fetch ${feed.name}: ${err.message}`)
      }
    }

    return results
  }
}
