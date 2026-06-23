import { Controller, Get } from '@nestjs/common'
import { HealthCheck, HealthCheckService } from '@nestjs/terminus'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { PrismaHealthIndicator } from '../prisma/prisma.health'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Database and service health check' })
  check() {
    return this.health.check([
      () => this.prisma.isHealthy('neon-database'),
    ])
  }
}
