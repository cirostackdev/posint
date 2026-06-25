import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { Public } from '../common/decorators/public.decorator'

interface HealthStatus {
  status: 'ok' | 'degraded' | 'down'
  database: 'connected' | 'disconnected'
  redis: 'connected' | 'disconnected'
  uptime: number
  timestamp: string
  version: string
}

interface DetailedHealthStatus extends HealthStatus {
  dataFreshness: {
    politicians: string | null
    bills: string | null
    cases: string | null
    social: string | null
  }
  pipeline: {
    lastRun: string | null
    status: 'healthy' | 'stale' | 'offline'
    queuesActive: number
  }
}

@ApiTags('Health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Basic health check' })
  async getHealth(): Promise<HealthStatus> {
    const [dbStatus, redisStatus] = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
    ])

    const dbConnected = dbStatus.status === 'fulfilled' && dbStatus.value
    const redisConnected = redisStatus.status === 'fulfilled' && redisStatus.value

    const overallStatus = dbConnected && redisConnected ? 'ok'
      : dbConnected || redisConnected ? 'degraded' : 'down'

    return {
      status: overallStatus,
      database: dbConnected ? 'connected' : 'disconnected',
      redis: redisConnected ? 'connected' : 'disconnected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '1.0.0',
    }
  }

  @Get('detailed')
  @Public()
  @ApiOperation({ summary: 'Detailed health with data freshness and pipeline status' })
  async getDetailedHealth(): Promise<DetailedHealthStatus> {
    const basic = await this.getHealth()
    const [freshness, pipeline] = await Promise.allSettled([
      this.checkDataFreshness(),
      this.checkPipelineHealth(),
    ])

    return {
      ...basic,
      dataFreshness: freshness.status === 'fulfilled' ? freshness.value : { politicians: null, bills: null, cases: null, social: null },
      pipeline: pipeline.status === 'fulfilled' ? pipeline.value : { lastRun: null, status: 'offline', queuesActive: 0 },
    }
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`
      return true
    } catch { return false }
  }

  private async checkRedis(): Promise<boolean> {
    try {
      const testKey = `health-check-${Date.now()}`
      await this.redis.set(testKey, '1', 5)
      const result = await this.redis.get(testKey)
      return result !== null
    } catch { return false }
  }

  private async checkDataFreshness(): Promise<DetailedHealthStatus['dataFreshness']> {
    try {
      const [politician, bill, corruption, social] = await Promise.allSettled([
        this.prisma.politician.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
        this.prisma.sponsoredBill.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
        this.prisma.corruptionCase.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
        this.prisma.socialMention.findFirst({ orderBy: { publishedAt: 'desc' }, select: { publishedAt: true } }),
      ])
      return {
        politicians: politician.status === 'fulfilled' ? politician.value?.updatedAt?.toISOString() ?? null : null,
        bills: bill.status === 'fulfilled' ? bill.value?.updatedAt?.toISOString() ?? null : null,
        cases: corruption.status === 'fulfilled' ? corruption.value?.updatedAt?.toISOString() ?? null : null,
        social: social.status === 'fulfilled' ? social.value?.publishedAt?.toISOString() ?? null : null,
      }
    } catch {
      return { politicians: null, bills: null, cases: null, social: null }
    }
  }

  private async checkPipelineHealth(): Promise<DetailedHealthStatus['pipeline']> {
    try {
      const [lastRun, activeQueues] = await Promise.all([
        this.redis.get<string>('pipeline:last-run'),
        this.redis.get<string>('pipeline:active-queues'),
      ])
      const lastRunDate = lastRun ? new Date(lastRun) : null
      const hoursSinceLastRun = lastRunDate
        ? (Date.now() - lastRunDate.getTime()) / (1000 * 60 * 60)
        : Infinity
      return {
        lastRun: lastRun ?? null,
        status: hoursSinceLastRun < 6 ? 'healthy' : hoursSinceLastRun < 24 ? 'stale' : 'offline',
        queuesActive: Number(activeQueues) || 0,
      }
    } catch {
      return { lastRun: null, status: 'offline', queuesActive: 0 }
    }
  }
}
