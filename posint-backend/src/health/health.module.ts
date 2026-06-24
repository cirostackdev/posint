import { Module } from '@nestjs/common'
import { HealthController } from './health.controller'
import { PrismaModule } from '../prisma/prisma.module'
import { RedisModule } from '../redis/redis.module'
import { PusherModule } from '../pusher/pusher.module'
import { PipelineModule } from '../pipeline/pipeline.module'

@Module({
  imports: [PrismaModule, RedisModule, PusherModule, PipelineModule],
  controllers: [HealthController],
})
export class HealthModule {}
