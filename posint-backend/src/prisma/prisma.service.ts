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

// ─── Global BigInt Serialization Fix ─────────────────────
// Prevents "TypeError: Do not know how to serialize a BigInt" in JSON.stringify.
// BigInt values (asset amounts, project budgets) are stored as bigint in Postgres
// and returned as BigInt by Prisma. Express/NestJS serialize responses via JSON.stringify
// which doesn't handle BigInt natively.
//
// This patch is safe: all BigInt → string conversions happen at JSON boundary only.
// Consumers should treat these values as strings and use BigInt() to parse when needed.
declare global {
  interface BigInt {
    toJSON(): string
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString()
}
