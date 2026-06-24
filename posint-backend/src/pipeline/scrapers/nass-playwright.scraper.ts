import { Injectable } from '@nestjs/common'
import { PlaywrightScraper } from './playwright.scraper'
import { ProvenanceService } from '../../provenance/provenance.service'
import { ProxyService } from '../proxy/proxy.service'

export interface NassScrapedBill {
  title: string
  sponsorName: string
  status: string
  chamber: string
  dateIntroduced: string
  sourceUrl: string
  sourceRecordId: string
}

@Injectable()
export class NassPlaywrightScraper extends PlaywrightScraper {
  constructor(provenance: ProvenanceService, proxyService: ProxyService) {
    super(provenance, proxyService)
  }

  async scrape(): Promise<NassScrapedBill[]> {
    const results: NassScrapedBill[] = []

    try {
      const page = await this.newPage()

      const { sourceRecordId } = await this.navigateAndRecord(
        page,
        'https://nass.gov.ng/documents/bills',
      )

      // Wait for content (JS-rendered site)
      await page.waitForSelector('table, .bill-item, .document-list, .document-card', { timeout: 15000 })
        .catch(() => this.logger.warn('No bill elements found — NASS site structure may have changed'))

      // Try multiple selectors for resilience
      const billData = await page.$$eval(
        'table tbody tr, .bill-item, .document-card',
        (rows) => rows.map(row => ({
          text: row.textContent?.trim() ?? '',
          link: (row.querySelector('a') as HTMLAnchorElement)?.href ?? '',
        }))
      ).catch(() => [] as { text: string; link: string }[])

      for (const bill of billData.slice(0, 50)) {
        if (!bill.text || bill.text.length < 10) continue

        const parsed = this.parseBillText(bill.text)
        if (parsed) {
          results.push({
            ...parsed,
            sourceUrl: bill.link || 'https://nass.gov.ng/documents/bills',
            sourceRecordId,
          })
        }

        await this.humanDelay(500, 1500)
      }

      await this.closeBrowser()
    } catch (err: any) {
      this.logger.error(`NASS Playwright scrape failed: ${err.message}`)
      await this.closeBrowser()
    }

    this.logger.log(`NASS: scraped ${results.length} bills`)
    return results
  }

  private parseBillText(text: string): Omit<NassScrapedBill, 'sourceUrl' | 'sourceRecordId'> | null {
    // NASS bills often: "Title \n Sponsor \n Status \n Chamber \n Date"
    const lines = text.split(/[\n\t|]/).map(l => l.trim()).filter(Boolean)

    if (lines.length >= 3) {
      return {
        title: lines[0].slice(0, 300),
        sponsorName: lines[1] ?? 'Unknown',
        status: lines[2] ?? 'Unknown',
        chamber: (lines[3] ?? '').toLowerCase().includes('senate') ? 'SENATE' : 'HOUSE_OF_REPRESENTATIVES',
        dateIntroduced: lines[4] ?? new Date().toISOString().split('T')[0],
      }
    }

    if (text.length > 20 && text.length < 500) {
      return {
        title: text.slice(0, 300),
        sponsorName: 'Unknown',
        status: 'Unknown',
        chamber: 'SENATE',
        dateIntroduced: new Date().toISOString().split('T')[0],
      }
    }

    return null
  }
}
