import { Logger } from '@nestjs/common'
import * as cheerio from 'cheerio'
import { ProvenanceService } from '../../provenance/provenance.service'

export interface ScrapeResult {
  html: string
  sourceRecordId: string
  url: string
}

export abstract class BaseScraper {
  protected readonly logger = new Logger(this.constructor.name)

  constructor(protected provenance: ProvenanceService) {}

  /**
   * Fetch HTML and record source provenance.
   * Returns the HTML, the source_record ID, and the URL for downstream fact linking.
   */
  protected async fetchAndRecord(url: string, sourceId?: string, retries = 3): Promise<ScrapeResult> {
    const html = await this.fetchHtml(url, retries)

    const sourceRecord = await this.provenance.recordSource({
      url,
      content: html,
      contentType: 'html',
      sourceId,
      httpStatus: 200,
    })

    return { html, sourceRecordId: sourceRecord.id, url }
  }

  protected async fetchHtml(url: string, retries = 3): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': this.getRandomUserAgent(),
            Accept: 'text/html,application/xhtml+xml',
          },
          signal: AbortSignal.timeout(15000),
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`)
        return response.text()
      } catch (err: any) {
        this.logger.warn(`Attempt ${attempt}/${retries} failed for ${url}: ${err.message}`)
        if (attempt === retries) throw err
        await this.sleep(attempt * 2000 + Math.random() * 1000)
      }
    }
    throw new Error('All retries exhausted')
  }

  protected parseHtml(html: string) {
    return cheerio.load(html)
  }

  protected sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private getRandomUserAgent(): string {
    const agents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
    ]
    return agents[Math.floor(Math.random() * agents.length)]
  }

  abstract scrape(): Promise<any[]>
}
