import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PusherService } from './pusher.service'

@Global()
@Module({
  providers: [
    {
      provide: 'PUSHER_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const appId = configService.get<string>('pusher.appId')
        const key = configService.get<string>('pusher.key')
        const secret = configService.get<string>('pusher.secret')
        const cluster = configService.get<string>('pusher.cluster')

        if (!appId || !key || !secret) {
          return null // Pusher not configured
        }

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Pusher = require('pusher')
        return new Pusher({ appId, key, secret, cluster, useTLS: true })
      },
    },
    PusherService,
  ],
  exports: [PusherService],
})
export class PusherModule {}
