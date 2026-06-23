import { Injectable } from '@nestjs/common'
import { BaseScraper } from './base.scraper'

export interface ScrapedCase {
  politicianName: string
  charges: string
  description: string
  sourceUrl: string
}

@Injectable()
export class EfccScraper extends BaseScraper {
  async scrape(): Promise<ScrapedCase[]> {
    return this.scrapePresseReleases()
  }

  async scrapePresseReleases(): Promise<ScrapedCase[]> {
    const results: ScrapedCase[] = []

    try {
      const html = await this.fetchHtml('https://efcc.gov.ng/news')
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
