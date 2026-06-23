import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RedisService } from './redis.service'

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const url = configService.get<string>('redis.url')
        const token = configService.get<string>('redis.token')

        // If Upstash credentials provided, use them
        if (url && token) {
          const { Redis } = await import('@upstash/redis')
          return new Redis({ url, token })
        }

        // Fallback: return null (RedisService will handle gracefully)
        return null
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}
