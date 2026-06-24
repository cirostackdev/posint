import { Controller, Get, Post, Patch, Delete, Param, Query, Body, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/strategies/jwt.strategy'
import { LegislatureService } from './legislature.service'
import { QueryBillsDto } from './dto/query-bills.dto'
import { CreateBillDto } from './dto/create-bill.dto'
import { UpdateBillDto } from './dto/update-bill.dto'

@ApiTags('Legislature')
@Controller({ path: 'legislature', version: '1' })
export class LegislatureController {
  constructor(private legislatureService: LegislatureService) {}

  @Get('bills') @Public() @ApiOperation({ summary: 'List bills' })
  findAll(@Query() query: QueryBillsDto) { return this.legislatureService.findAllBills(query) }

  @Get('bills/stats') @Public() @ApiOperation({ summary: 'Bill statistics' })
  getStats() { return this.legislatureService.getBillStats() }

  @Get('bills/:id') @Public() @ApiOperation({ summary: 'Bill detail' })
  findById(@Param('id', ParseUUIDPipe) id: string) { return this.legislatureService.findBillById(id) }

  @Post('bills') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Create bill (admin)' })
  create(@Body() dto: CreateBillDto, @CurrentUser() user: JwtPayload) { return this.legislatureService.createBill(dto, user.sub) }

  @Patch('bills/:id') @Roles('ADMIN') @ApiBearerAuth() @ApiOperation({ summary: 'Update bill (admin)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBillDto, @CurrentUser() user: JwtPayload) { return this.legislatureService.updateBill(id, dto, user.sub) }

  @Delete('bills/:id') @Roles('ADMIN') @HttpCode(HttpStatus.NO_CONTENT) @ApiBearerAuth() @ApiOperation({ summary: 'Delete bill (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) { return this.legislatureService.removeBill(id, user.sub) }
}
