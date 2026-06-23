import { Controller, Get, Post, Patch, Delete, Param, Query, Body, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/strategies/jwt.strategy'
import { CorruptionService } from './corruption.service'
import { QueryCasesDto } from './dto/query-cases.dto'
import { CreateCaseDto } from './dto/create-case.dto'
import { UpdateCaseDto } from './dto/update-case.dto'

@ApiTags('Anti-Corruption')
@Controller({ path: 'corruption', version: '1' })
export class CorruptionController {
  constructor(private corruptionService: CorruptionService) {}

  @Get('cases') @Public() @ApiOperation({ summary: 'List corruption cases' })
  findAll(@Query() query: QueryCasesDto) { return this.corruptionService.findAll(query) }

  @Get('cases/stats') @Public() @ApiOperation({ summary: 'Corruption statistics' })
  getStats() { return this.corruptionService.getStats() }

  @Get('cases/:id/related') @Public() @ApiOperation({ summary: 'Related cases' })
  findRelated(@Param('id', ParseUUIDPipe) id: string) { return this.corruptionService.findRelated(id) }

  @Get('cases/:id') @Public() @ApiOperation({ summary: 'Case detail' })
  findById(@Param('id', ParseUUIDPipe) id: string) { return this.corruptionService.findById(id) }

  @Post('cases') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Create case (admin)' })
  create(@Body() dto: CreateCaseDto, @CurrentUser() user: JwtPayload) { return this.corruptionService.create(dto, user.sub) }

  @Patch('cases/:id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Update case (admin)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCaseDto, @CurrentUser() user: JwtPayload) { return this.corruptionService.update(id, dto, user.sub) }

  @Delete('cases/:id') @Roles('ADMIN') @HttpCode(HttpStatus.NO_CONTENT) @ApiBearerAuth() @ApiOperation({ summary: 'Soft-delete case (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) { return this.corruptionService.remove(id, user.sub) }
}
