import { Controller, Get, Query, BadRequestException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { SearchService } from './search.service'

@ApiTags('Search')
@Controller({ path: 'search', version: '1' })
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Global search across all entities' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query (min 2 chars)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Max results', example: 10 })
  async search(@Query('q') q: string, @Query('limit') limit?: string) {
    if (!q || q.trim().length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters')
    }
    const limitNum = parseInt(limit || '10', 10)
    return this.searchService.globalSearch(q, limitNum)
  }
}
