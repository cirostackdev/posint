import { Controller, Get, Post, Patch, Param, Query, Body } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/strategies/jwt.strategy'
import { PartiesService } from './parties.service'
import { CreatePartyDto } from './dto/create-party.dto'

@ApiTags('Parties')
@Controller({ path: 'parties', version: '1' })
export class PartiesController {
  constructor(private partiesService: PartiesService) {}

  @Get() @Public() @ApiOperation({ summary: 'All parties with seat counts' })
  findAll() { return this.partiesService.findAll() }

  @Get('seat-distribution') @Public() @ApiOperation({ summary: 'Seat distribution for charts' })
  getSeatDistribution() { return this.partiesService.getSeatDistribution() }

  @Get(':slug') @Public() @ApiOperation({ summary: 'Party detail with members' })
  findBySlug(@Param('slug') slug: string) { return this.partiesService.findBySlug(slug) }

  @Post() @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Create party (admin)' })
  create(@Body() dto: CreatePartyDto, @CurrentUser() user: JwtPayload) { return this.partiesService.create(dto, user.sub) }

  @Patch(':id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Update party (admin)' })
  update(@Param('id') id: string, @Body() dto: Partial<CreatePartyDto>, @CurrentUser() user: JwtPayload) { return this.partiesService.update(id, dto, user.sub) }
}
