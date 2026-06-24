import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface ProxyConfig {
  server: string
  username?: string
  password?: string
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name)
  private proxies: ProxyConfig[] = []
  private currentIndex = 0

  constructor(private config: ConfigService) {
    this.loadProxies()
  }

  private loadProxies() {
    // Load from env: PROXY_LIST=host1:port1:user1:pass1,host2:port2:user2:pass2
    const proxyList = this.config.get<string>('PROXY_LIST', '')
    if (!proxyList) {
      this.logger.warn('No PROXY_LIST configured — scrapers will use direct connection')
      return
    }

    this.proxies = proxyList.split(',').map(entry => {
      const [host, port, username, password] = entry.trim().split(':')
      return {
        server: `http://${host}:${port}`,
        username,
        password,
      }
    })
    this.logger.log(`Loaded ${this.proxies.length} proxies for rotation`)
  }

  /** Get next proxy in round-robin. Returns null if no proxies configured. */
  getNext(): ProxyConfig | null {
    if (this.proxies.length === 0) return null
    const proxy = this.proxies[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length
    return proxy
  }

  /** Get a random proxy (better for parallel scrapers). */
  getRandom(): ProxyConfig | null {
    if (this.proxies.length === 0) return null
    return this.proxies[Math.floor(Math.random() * this.proxies.length)]
  }

  /** Report a proxy as failed (for health tracking). */
  reportFailure(proxy: ProxyConfig) {
    this.logger.warn(`Proxy failed: ${proxy.server}`)
  }

  hasProxies(): boolean {
    return this.proxies.length > 0
  }
}
