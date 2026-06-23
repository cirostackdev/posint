import { Injectable } from '@nestjs/common'
import { BaseScraper } from './base.scraper'

@Injectable()
export class InecScraper extends BaseScraper {
  async scrape(): Promise<any[]> {
    this.logger.log('INEC scraper: stub implementation — manual data entry required')
    return []
  }
}
