import { Controller, Post, Get, Patch, Param, Body, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/strategies/jwt.strategy'
import { CorrectionsService } from './corrections.service'

class SubmitCorrectionDto {
  entityType: string
  entityId: string
  fieldName: string
  currentValue: string
  proposedValue: string
  evidence?: string
  submitterName: string
  submitterEmail: string
}

@ApiTags('Corrections')
@Controller({ path: 'corrections', version: '1' })
export class CorrectionsController {
  constructor(private correctionsService: CorrectionsService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Submit a correction request (public)' })
  submit(@Body() dto: SubmitCorrectionDto) {
    return this.correctionsService.submit(dto)
  }

  @Get()
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List pending corrections (admin/editor)' })
  listPending(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.correctionsService.listPending(+page, +limit)
  }

  @Patch(':id/approve')
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve a correction' })
  approve(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body('notes') notes?: string,
  ) {
    return this.correctionsService.approve(id, user.sub, notes)
  }

  @Patch(':id/reject')
  @Roles('ADMIN', 'EDITOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a correction' })
  reject(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body('notes') notes: string,
  ) {
    return this.correctionsService.reject(id, user.sub, notes)
  }
}
