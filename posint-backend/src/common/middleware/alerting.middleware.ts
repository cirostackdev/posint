import { Injectable, NestMiddleware, Logger } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class AlertingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Alerting')
  private errorCount = 0
  private errorWindowStart = Date.now()
  private readonly ERROR_THRESHOLD = 50
  private readonly WINDOW_MS = 60_000

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now()

    res.on('finish', () => {
      const duration = Date.now() - startTime
      const statusCode = res.statusCode

      if (statusCode >= 500) {
        this.trackError()
      }

      if (duration > 5000) {
        this.logger.warn(`Slow response: ${req.method} ${req.originalUrl} took ${duration}ms`)
      }
    })

    next()
  }

  private trackError() {
    const now = Date.now()
    if (now - this.errorWindowStart > this.WINDOW_MS) {
      this.errorCount = 0
      this.errorWindowStart = now
    }
    this.errorCount++
    if (this.errorCount >= this.ERROR_THRESHOLD) {
      this.logger.error(`ERROR RATE ALERT: ${this.errorCount} errors in the last ${this.WINDOW_MS / 1000}s`)
      this.errorCount = 0
      this.errorWindowStart = now
    }
  }
}
