import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/strategies/jwt.strategy'
import { ApiKeysService } from './api-keys.service'

class CreateApiKeyDto {
  name: string
  tier?: string
}

@ApiTags('API Keys')
@Controller({ path: 'api-keys', version: '1' })
@ApiBearerAuth()
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new API key' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateApiKeyDto) {
    return this.apiKeysService.createKey(user.sub, dto.name, dto.tier)
  }

  @Get()
  @ApiOperation({ summary: 'List all API keys for the current user' })
  list(@CurrentUser() user: JwtPayload) {
    return this.apiKeysService.getUserKeys(user.sub)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke an API key' })
  revoke(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.apiKeysService.revokeKey(id, user.sub)
  }
}
