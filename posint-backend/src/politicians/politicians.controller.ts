import {
  Controller, Get, Post, Patch, Delete,
  Param, Query, Body, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/strategies/jwt.strategy'
import { PoliticiansService } from './politicians.service'
import { QueryPoliticiansDto } from './dto/query-politicians.dto'
import { CreatePoliticianDto } from './dto/create-politician.dto'
import { UpdatePoliticianDto } from './dto/update-politician.dto'

@ApiTags('Politicians')
@Controller({ path: 'politicians', version: '1' })
export class PoliticiansController {
  constructor(private politiciansService: PoliticiansService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List politicians with filters and pagination' })
  findAll(@Query() query: QueryPoliticiansDto) {
    return this.politiciansService.findAll(query)
  }

  @Get('stats')
  @Public()
  @ApiOperation({ summary: 'Aggregated politician statistics' })
  getStats() {
    return this.politiciansService.getStats()
  }

  @Get(':slug/voting-records')
  @Public()
  @ApiOperation({ summary: 'Voting records for a politician' })
  getVotingRecords(@Param('slug') slug: string) {
    return this.politiciansService.getVotingRecords(slug)
  }

  @Get(':slug/bills')
  @Public()
  @ApiOperation({ summary: 'Sponsored bills for a politician' })
  getBills(@Param('slug') slug: string) {
    return this.politiciansService.getBills(slug)
  }

  @Get(':slug/assets')
  @Public()
  @ApiOperation({ summary: 'Asset declarations for a politician' })
  getAssets(@Param('slug') slug: string) {
    return this.politiciansService.getAssets(slug)
  }

  @Get(':slug/projects')
  @Public()
  @ApiOperation({ summary: 'Constituency projects for a politician' })
  getProjects(@Param('slug') slug: string) {
    return this.politiciansService.getProjects(slug)
  }

  @Get(':slug/defections')
  @Public()
  @ApiOperation({ summary: 'Party defection history for a politician' })
  getDefections(@Param('slug') slug: string) {
    return this.politiciansService.getDefections(slug)
  }

  @Get(':slug/career')
  @Public()
  @ApiOperation({ summary: 'Career timeline for a politician' })
  getCareer(@Param('slug') slug: string) {
    return this.politiciansService.getCareer(slug)
  }

  @Get(':slug/committees')
  @Public()
  @ApiOperation({ summary: 'Committee assignments for a politician' })
  getCommittees(@Param('slug') slug: string) {
    return this.politiciansService.getCommittees(slug)
  }

  @Get(':slug/social')
  @Public()
  @ApiOperation({ summary: 'Social media data for a politician' })
  getSocial(@Param('slug') slug: string) {
    return this.politiciansService.getSocial(slug)
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'Full politician profile by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.politiciansService.findBySlug(slug)
  }

  @Post()
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new politician (admin only)' })
  create(@Body() dto: CreatePoliticianDto, @CurrentUser() user: JwtPayload) {
    return this.politiciansService.create(dto, user.sub)
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update politician (admin only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePoliticianDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.politiciansService.update(id, dto, user.sub)
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft-delete politician (admin only)' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.politiciansService.remove(id, user.sub)
  }
}
