import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common'
import { ApiKeysService } from '../api-keys.service'

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const apiKey = request.headers['x-api-key']

    if (!apiKey) return true

    const keyData = await this.apiKeysService.validateKey(apiKey)
    if (!keyData) {
      throw new HttpException('Invalid API key', HttpStatus.UNAUTHORIZED)
    }

    const withinLimit = await this.apiKeysService.checkRateLimit(apiKey, keyData.tier)
    if (!withinLimit) {
      throw new HttpException('Rate limit exceeded for your API tier', HttpStatus.TOO_MANY_REQUESTS)
    }

    request.apiTier = keyData.tier
    request.apiKeyUserId = keyData.userId
    return true
  }
}
