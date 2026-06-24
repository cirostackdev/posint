import { Controller, Get, Logger } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { PusherService } from '../pusher/pusher.service'
import { PipelineService } from '../pipeline/pipeline.service'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name)

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private pusher: PusherService,
    private pipeline: PipelineService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Enhanced health check with service monitoring and metrics' })
  async getHealth() {
    const startTime = Date.now();
    const health: any = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {},
      metrics: this.getSystemMetrics(),
    }

    // Database check
    try {
      const dbStart = Date.now()
      await this.prisma.$queryRaw`SELECT 1`
      const dbResponseTime = Date.now() - dbStart
      health.services['database'] = {
        status: 'ok',
        responseTime: dbResponseTime,
      }
    } catch (error) {
      health.services['database'] = {
        status: 'down',
        error: error instanceof Error ? error.message : String(error),
      }
      health.status = 'degraded'
      await this.alertService('database', error)
    }

    // Redis check
    try {
      const redisStart = Date.now()
      // Attempt a simple operation to check connectivity
      const testKey = `health-check-${Date.now()}`
      await this.redis.set(testKey, '1', 1)
      const redisResponseTime = Date.now() - redisStart
      health.services['redis'] = {
        status: 'ok',
        responseTime: redisResponseTime,
      }
    } catch (error) {
      health.services['redis'] = {
        status: 'down',
        error: error instanceof Error ? error.message : String(error),
      }
      health.status = 'degraded'
      await this.alertService('redis', error)
    }

    // Pipeline queues check
    try {
      const queueStatus = await this.pipeline.getJobsStatus()
      let totalFailed = 0
      let totalActive = 0
      let totalCompleted = 0

      // Sum across all queues
      Object.values(queueStatus).forEach((queue: any) => {
        totalActive += queue.active || 0
        totalCompleted += queue.completed || 0
        totalFailed += queue.failed || 0
      })

      health.services['pipeline'] = {
        status: totalFailed > 100 ? 'degraded' : 'ok',
        activeJobs: totalActive,
        completedJobs: totalCompleted,
        failedJobs: totalFailed,
        queues: queueStatus,
      }

      if (totalFailed > 100) {
        health.status = 'degraded'
        await this.alertService('pipeline', `${totalFailed} failed jobs detected`)
      }
    } catch (error) {
      health.services['pipeline'] = {
        status: 'down',
        error: error instanceof Error ? error.message : String(error),
      }
      health.status = 'degraded'
      await this.alertService('pipeline', error)
    }

    // Pusher connectivity check
    try {
      // Pusher is optional and doesn't expose a ping method in the service
      // We verify it's configured by checking if trigger method exists
      health.services['pusher'] = {
        status: this.pusher ? 'ok' : 'disabled',
      }
    } catch (error) {
      health.services['pusher'] = {
        status: 'down',
        error: error instanceof Error ? error.message : String(error),
      }
    }

    const totalTime = Date.now() - startTime
    health.checkDuration = totalTime

    return health
  }

  private getSystemMetrics() {
    const memUsage = process.memoryUsage()
    return {
      memory: {
        heapUsed: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotal: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100,
        rss: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100,
        external: Math.round((memUsage.external / 1024 / 1024) * 100) / 100,
      },
      cpu: process.cpuUsage(),
    }
  }

  private async alertService(service: string, error: unknown) {
    try {
      await this.pusher.triggerAdmin('service-health-alert', {
        service,
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : String(error),
        severity: 'high',
      })
    } catch (e) {
      this.logger.error(`[Health] Alert send failed: ${e instanceof Error ? e.message : String(e)}`)
    }
  }
}
