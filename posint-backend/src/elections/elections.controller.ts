import { Controller, Get, Post, Patch, Delete, Param, Query, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/strategies/jwt.strategy'
import { ElectionsService } from './elections.service'
import { QueryElectionsDto } from './dto/query-elections.dto'
import { CreateElectionDto } from './dto/create-election.dto'
import { UpdateElectionDto } from './dto/update-election.dto'

@ApiTags('Elections')
@Controller({ path: 'elections', version: '1' })
export class ElectionsController {
  constructor(private electionsService: ElectionsService) {}

  @Get() @Public() @ApiOperation({ summary: 'List elections' })
  findAll(@Query() query: QueryElectionsDto) { return this.electionsService.findAll(query) }

  @Get('stats') @Public() @ApiOperation({ summary: 'Election statistics' })
  getStats() { return this.electionsService.getStats() }

  @Get(':id') @Public() @ApiOperation({ summary: 'Election detail with candidates' })
  findById(@Param('id') id: string) { return this.electionsService.findById(id) }

  @Post() @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Create election (admin)' })
  create(@Body() dto: CreateElectionDto, @CurrentUser() user: JwtPayload) { return this.electionsService.create(dto, user.sub) }

  @Patch(':id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Update election (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateElectionDto, @CurrentUser() user: JwtPayload) { return this.electionsService.update(id, dto, user.sub) }

  @Delete(':id') @Roles('ADMIN') @HttpCode(HttpStatus.NO_CONTENT) @ApiBearerAuth() @ApiOperation({ summary: 'Delete election (admin)' })
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) { return this.electionsService.remove(id, user.sub) }
}
