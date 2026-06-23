import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { CompareService } from './compare.service'

@ApiTags('Compare')
@Controller({ path: 'compare', version: '1' })
export class CompareController {
  constructor(private compareService: CompareService) {}

  @Get('metrics')
  @Public()
  @ApiOperation({ summary: 'Comparison metrics for 2–4 politicians' })
  @ApiQuery({ name: 'ids', description: 'Comma-separated politician IDs (2-4)', example: 'uuid1,uuid2' })
  getMetrics(@Query('ids') ids: string) {
    const idList = (ids || '').split(',').map((id) => id.trim()).filter(Boolean)
    return this.compareService.getMetrics(idList)
  }
}
