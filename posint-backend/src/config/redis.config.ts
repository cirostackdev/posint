import { registerAs } from '@nestjs/config'

export default registerAs('redis', () => ({
  // For @upstash/redis (cache)
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  // For BullMQ (ioredis)
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
}))
