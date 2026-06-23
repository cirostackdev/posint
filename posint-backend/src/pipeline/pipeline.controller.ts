import { Controller, Post, Get, Body } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { Roles } from '../common/decorators/roles.decorator'
import { PipelineService } from './pipeline.service'
import { TriggerJobDto } from './dto/trigger-job.dto'

@ApiTags('Pipeline')
@Controller({ path: 'pipeline', version: '1' })
@Roles('ADMIN')
@ApiBearerAuth()
export class PipelineController {
  constructor(private pipelineService: PipelineService) {}

  @Post('trigger/nass') @ApiOperation({ summary: 'Trigger NASS scrape' })
  triggerNass() { return this.pipelineService.triggerNass() }

  @Post('trigger/efcc') @ApiOperation({ summary: 'Trigger EFCC scrape' })
  triggerEfcc() { return this.pipelineService.triggerEfcc() }

  @Post('trigger/inec') @ApiOperation({ summary: 'Trigger INEC scrape' })
  triggerInec() { return this.pipelineService.triggerInec() }

  @Post('trigger/social') @ApiOperation({ summary: 'Trigger social media fetch' })
  triggerSocial(@Body() dto: TriggerJobDto) { return this.pipelineService.triggerSocial(dto.targetId) }

  @Post('trigger/sentiment') @ApiOperation({ summary: 'Trigger sentiment computation' })
  triggerSentiment() { return this.pipelineService.triggerSentiment() }

  @Post('trigger/stats') @ApiOperation({ summary: 'Recompute platform stats' })
  triggerStats() { return this.pipelineService.triggerStats() }

  @Get('jobs') @ApiOperation({ summary: 'Job queue status' })
  getStatus() { return this.pipelineService.getJobsStatus() }
}
