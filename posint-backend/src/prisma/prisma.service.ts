import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
      datasources: {
        db: { url: process.env.DATABASE_URL },
      },
    })
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Connected to Neon PostgreSQL')

    if (process.env.NODE_ENV === 'development') {
      this.$on('query' as never, (e: any) => {
        if (e.duration > 100) {
          this.logger.warn(`Slow query (${e.duration}ms): ${e.query}`)
        }
      })
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log('Disconnected from Neon PostgreSQL')
  }
}
