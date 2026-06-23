import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | string[] = 'Internal server error'
    let error = 'Internal Server Error'

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus()
      const exResponse = exception.getResponse()
      if (typeof exResponse === 'object' && exResponse !== null && 'message' in exResponse) {
        message = (exResponse as any).message
        error = (exResponse as any).error || exception.name
      } else {
        message = exception.message
      }
    } else {
      const err = exception as any
      if (err?.code === 'P2002') {
        statusCode = HttpStatus.CONFLICT
        message = 'Record already exists'
        error = 'Conflict'
      } else if (err?.code === 'P2025') {
        statusCode = HttpStatus.NOT_FOUND
        message = 'Record not found'
        error = 'Not Found'
      } else {
        this.logger.error('Unhandled exception:', exception)
      }
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}
