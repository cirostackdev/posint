import { Logger } from '@nestjs/common'
import { chromium, Browser, Page } from 'playwright-core'
import { ProvenanceService } from '../../provenance/provenance.service'
import { ProxyService } from '../proxy/proxy.service'

export interface PlaywrightScrapeResult {
  html: string
  sourceRecordId: string
  url: string
}

export abstract class PlaywrightScraper {
  protected readonly logger = new Logger(this.constructor.name)
  private browser: Browser | null = null

  constructor(
    protected provenance: ProvenanceService,
    protected proxyService: ProxyService,
  ) {}

  /**
   * Launch headless browser with optional proxy.
   * Re-uses existing instance if already launched.
   */
  protected async launchBrowser(): Promise<Browser> {
    if (this.browser) return this.browser

    const proxy = this.proxyService.getRandom()
    const launchOptions: Parameters<typeof chromium.launch>[0] = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    }

    if (proxy) {
      launchOptions.proxy = {
        server: proxy.server,
        username: proxy.username,
        password: proxy.password,
      }
    }

    this.browser = await chromium.launch(launchOptions)
    return this.browser
  }

  /**
   * Create a new page with anti-detection measures:
   * - Random user agent (real browser strings)
   * - Nigerian locale and timezone
   * - Resource blocking (images, fonts, trackers)
   */
  protected async newPage(): Promise<Page> {
    const browser = await this.launchBrowser()
    const context = await browser.newContext({
      userAgent: this.getRandomUserAgent(),
      viewport: { width: 1366, height: 768 },
      locale: 'en-NG',
      timezoneId: 'Africa/Lagos',
    })

    const page = await context.newPage()

    // Block unnecessary resources to speed up scraping
    await page.route('**/*.{png,jpg,jpeg,gif,svg,ico,woff,woff2,ttf}', route => route.abort())
    await page.route('**/analytics/**', route => route.abort())
    await page.route('**/tracking/**', route => route.abort())
    await page.route('**/google-analytics.com/**', route => route.abort())
    await page.route('**/googletagmanager.com/**', route => route.abort())

    return page
  }

  /**
   * Navigate to URL, wait for content, record provenance, return result.
   */
  protected async navigateAndRecord(
    page: Page,
    url: string,
    sourceId?: string,
  ): Promise<PlaywrightScrapeResult> {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    // Human-like delay for dynamic content rendering
    await page.waitForTimeout(2000 + Math.random() * 2000)

    const html = await page.content()

    const sourceRecord = await this.provenance.recordSource({
      url,
      content: html,
      contentType: 'html',
      sourceId,
      httpStatus: 200,
    })

    return { html, sourceRecordId: sourceRecord.id, url }
  }

  /**
   * Close browser and release resources.
   */
  protected async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  /**
   * Random human-like delay between interactions.
   */
  protected async humanDelay(minMs = 1000, maxMs = 3000): Promise<void> {
    const delay = minMs + Math.random() * (maxMs - minMs)
    await new Promise<void>(resolve => setTimeout(resolve, delay))
  }

  private getRandomUserAgent(): string {
    const agents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    ]
    return agents[Math.floor(Math.random() * agents.length)]
  }

  abstract scrape(): Promise<any[]>
}
