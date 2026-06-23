import { Controller, Post, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { PusherService } from '../pusher/pusher.service'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/strategies/jwt.strategy'

@ApiTags('Webhooks')
@Controller({ path: 'webhooks/pusher', version: '1' })
export class PusherAuthController {
  constructor(private pusherService: PusherService) {}

  @Post('auth')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Authenticate Pusher private channel' })
  auth(
    @Body('socket_id') socketId: string,
    @Body('channel_name') channelName: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pusherService.authenticateChannel(socketId, channelName, user.sub, user.role)
  }
}
