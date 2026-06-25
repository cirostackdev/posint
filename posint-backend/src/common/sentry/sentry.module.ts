import { Module, Global, OnModuleInit, Catch, ExceptionFilter, ArgumentsHost, Injectable } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { HttpException, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import * as Sentry from '@sentry/nestjs'

@Catch()
@Injectable()
class SentryExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR

    if (status >= 500 && process.env.NODE_ENV === 'production') {
      Sentry.captureException(exception)
    }

    if (response.headersSent) return

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : { statusCode: 500, message: 'Internal server error' }

    response.status(status).json(
      typeof message === 'string' ? { statusCode: status, message } : message
    )
  }
}

@Global()
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: SentryExceptionFilter,
    },
  ],
})
export class SentryModule implements OnModuleInit {
  onModuleInit() {
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
