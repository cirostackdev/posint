import { Injectable } from '@nestjs/common'
import { BaseScraper } from './base.scraper'

export interface ScrapedBill {
  title: string
  sponsorName: string
  status: string
  chamber: string
  dateIntroduced: string
  sourceUrl: string | null
}

@Injectable()
export class NassScraper extends BaseScraper {
  async scrape(): Promise<ScrapedBill[]> {
    return this.scrapeBills()
  }

  async scrapeBills(): Promise<ScrapedBill[]> {
    const results: ScrapedBill[] = []

    try {
      const html = await this.fetchHtml('https://nass.gov.ng/documents/bills')
      const $ = this.parseHtml(html)

      $('table.bills-table tbody tr').each((_, row) => {
        const cols = $(row).find('td')
        const title = $(cols[0]).text().trim()
        const sponsor = $(cols[1]).text().trim()
        const status = $(cols[2]).text().trim()
        const chamber = $(cols[3]).text().trim()
        const dateStr = $(cols[4]).text().trim()
        const link = $(cols[0]).find('a').attr('href')

        if (title && sponsor) {
          results.push({
            title,
            sponsorName: sponsor,
            status,
            chamber,
            dateIntroduced: dateStr,
            sourceUrl: link ? `https://nass.gov.ng${link}` : null,
          })
        }
      })
    } catch (err) {
      this.logger.error('Failed to scrape NASS bills:', err)
    }

    return results
  }
}
