import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { SocialService } from './social.service'
import { QuerySocialDto } from './dto/query-social.dto'

@ApiTags('Social Media')
@Controller({ path: 'social', version: '1' })
export class SocialController {
  constructor(private socialService: SocialService) {}

  @Get(':politicianId/posts') @Public() @ApiOperation({ summary: 'Social media posts for a politician' })
  getPosts(@Param('politicianId') id: string, @Query() query: QuerySocialDto) { return this.socialService.getPosts(id, query) }

  @Get(':politicianId/sentiment') @Public() @ApiOperation({ summary: 'Sentiment over time' })
  getSentiment(@Param('politicianId') id: string) { return this.socialService.getSentiment(id) }

  @Get(':politicianId/topics') @Public() @ApiOperation({ summary: 'Topic mentions' })
  getTopics(@Param('politicianId') id: string) { return this.socialService.getTopics(id) }

  @Get(':politicianId/stats') @Public() @ApiOperation({ summary: 'Overall social stats' })
  getStats(@Param('politicianId') id: string) { return this.socialService.getStats(id) }
}
