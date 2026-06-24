import { Injectable } from '@nestjs/common'
import { PlaywrightScraper } from './playwright.scraper'
import { ProvenanceService } from '../../provenance/provenance.service'
import { ProxyService } from '../proxy/proxy.service'

export interface EfccPressRelease {
  title: string
  description: string
  publishedDate: string
  sourceUrl: string
  sourceRecordId: string
  extractedNames: string[]
  extractedAmounts: string[]
}

@Injectable()
export class EfccPlaywrightScraper extends PlaywrightScraper {
  constructor(provenance: ProvenanceService, proxyService: ProxyService) {
    super(provenance, proxyService)
  }

  async scrape(): Promise<EfccPressRelease[]> {
    const results: EfccPressRelease[] = []

    try {
      const page = await this.newPage()

      const { sourceRecordId } = await this.navigateAndRecord(
        page,
        'https://efcc.gov.ng/news',
      )

      await page.waitForSelector('article, .news-item, .post-item, .entry', { timeout: 15000 })
        .catch(() => this.logger.warn('No article elements found on EFCC site'))

      const articles = await page.$$eval(
        'article, .news-item, .post-item, .entry, .press-release',
        (items) => items.map(item => ({
          title: (item.querySelector('h2, h3, .title, .entry-title') as HTMLElement)?.innerText?.trim() ?? '',
          description: (item.querySelector('p, .excerpt, .summary') as HTMLElement)?.innerText?.trim() ?? '',
          link: (item.querySelector('a') as HTMLAnchorElement)?.href ?? '',
          date: (item.querySelector('time[datetime]') as HTMLTimeElement)?.dateTime
            ?? (item.querySelector('time, .date, .meta-date') as HTMLElement)?.innerText?.trim() ?? '',
        }))
      ).catch(() => [] as { title: string; description: string; link: string; date: string }[])

      for (const article of articles.slice(0, 30)) {
        if (!article.title) continue

        const sourceUrl = article.link || 'https://efcc.gov.ng/news'

        results.push({
          title: article.title,
          description: article.description.slice(0, 2000),
          publishedDate: article.date || new Date().toISOString(),
          sourceUrl,
          sourceRecordId,
          extractedNames: this.extractNames(article.title + ' ' + article.description),
          extractedAmounts: this.extractAmounts(article.title + ' ' + article.description),
        })

        await this.humanDelay(800, 2000)
      }

      await this.closeBrowser()
    } catch (err: any) {
      this.logger.error(`EFCC scrape failed: ${err.message}`)
      await this.closeBrowser()
    }

    this.logger.log(`EFCC: scraped ${results.length} press releases`)
    return results
  }

  /**
   * Extract Nigerian names from EFCC press release text.
   * Handles patterns like "EFCC Arraigns John Doe for...", "former Governor Jane Smith..."
   */
  private extractNames(text: string): string[] {
    const patterns = [
      /(?:arraigns?|charges?|convicts?|sentences?)\s+(?:one\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/gi,
      /(?:former|ex-?)\s+(?:governor|senator|minister|president|chairman)\s+(?:of\s+\w+\s+(?:state\s+)?)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/gi,
      /(?:Chief|Dr|Prof|Alh|Hon|Sen|Barr)\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/g,
    ]

    const names = new Set<string>()
    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const name = match[1]?.trim()
        if (name && name.split(' ').length >= 2) {
          names.add(name)
        }
      }
    }

    return Array.from(names)
  }

  /**
   * Extract monetary amounts from Nigerian political text.
   * Handles: ₦2.5bn, N500 million, 3 billion naira
   */
  private extractAmounts(text: string): string[] {
    const patterns = [
      /[₦N]\s*[\d,]+(?:\.\d+)?(?:\s*(?:billion|million|trillion|bn|m|b))?/gi,
      /\d+(?:[.,]\d+)?\s*(?:billion|million|trillion|bn|m)\s*(?:naira)?/gi,
    ]

    const amounts: string[] = []
    for (const pattern of patterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        amounts.push(match[0].trim())
      }
    }

    return [...new Set(amounts)] // deduplicate
  }
}
