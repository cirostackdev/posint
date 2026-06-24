import { Injectable } from '@nestjs/common'
import { BaseScraper } from './base.scraper'
import { ProvenanceService } from '../../provenance/provenance.service'

export interface ScrapedCase {
  politicianName: string
  charges: string
  description: string
  sourceUrl: string
  sourceRecordId: string
}

@Injectable()
export class EfccScraper extends BaseScraper {
  constructor(provenance: ProvenanceService) {
    super(provenance)
  }

  async scrape(): Promise<ScrapedCase[]> {
    return this.scrapePresseReleases()
  }

  async scrapePresseReleases(): Promise<ScrapedCase[]> {
    const results: ScrapedCase[] = []

    try {
      const { html, sourceRecordId } = await this.fetchAndRecord('https://efcc.gov.ng/news')
      const $ = this.parseHtml(html)

      $('article, .news-item, .press-release').each((_, item) => {
        const title = $(item).find('h2, h3, .title').first().text().trim()
        const description = $(item).find('p').first().text().trim()
        const link = $(item).find('a').attr('href')

        if (title && description) {
          results.push({
            politicianName: this.extractNameFromTitle(title),
            charges: title,
            description,
            sourceUrl: link || 'https://efcc.gov.ng/news',
            sourceRecordId,
          })
        }
      })
    } catch (err) {
      this.logger.error('Failed to scrape EFCC press releases:', err)
    }

    return results
  }

  private extractNameFromTitle(title: string): string {
    // Extract name patterns like "EFCC Arraigns John Doe for..."
    const match = title.match(/arraigns?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i)
    return match ? match[1] : 'Unknown'
  }
}
