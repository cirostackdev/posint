import { Module, Global } from '@nestjs/common'
import * as Sentry from '@sentry/nestjs'

@Global()
@Module({
  providers: [],
})
export class SentryModule {
  constructor() {
    if (process.env.NODE_ENV !== 'production') return
    if (!process.env.SENTRY_DSN) return

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.2,
      ignoreErrors: ['UnauthorizedException', 'NotFoundException', 'ForbiddenException'],
    })
  }
}
