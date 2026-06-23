import { Module } from '@nestjs/common'
import { PusherAuthController } from './pusher-auth.controller'

@Module({
  controllers: [PusherAuthController],
})
export class WebhooksModule {}
