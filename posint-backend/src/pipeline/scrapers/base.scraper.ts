import { Logger } from '@nestjs/common'
import * as cheerio from 'cheerio'

export abstract class BaseScraper {
  protected readonly logger = new Logger(this.constructor.name)

  protected async fetchHtml(url: string, retries = 3): Promise<string> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'POSINT-DataBot/1.0 (+https://posint.ng/about)',
            Accept: 'text/html,application/xhtml+xml',
          },
          signal: AbortSignal.timeout(15000),
        })

        if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`)
        return response.text()
      } catch (err: any) {
        this.logger.warn(`Attempt ${attempt}/${retries} failed for ${url}: ${err.message}`)
        if (attempt === retries) throw err
        await this.sleep(attempt * 2000)
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

  abstract scrape(): Promise<any[]>
}
