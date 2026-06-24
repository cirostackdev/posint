import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { AdminService } from './admin.service'

@ApiTags('Public Stats')
@Controller({ path: 'stats', version: '1' })
export class PublicStatsController {
  constructor(private adminService: AdminService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Public platform stats for homepage (limited fields)' })
  async getPublicStats() {
    const full = await this.adminService.getPlatformStats()
    return {
      politicians: full.politicians,
      elections: full.elections,
      bills: full.bills,
      corruptionCases: full.corruptionCases,
      totalRecoveredKobo: full.totalRecoveredKobo,
    }
  }
}
