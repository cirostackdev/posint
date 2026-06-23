import { Controller, Get, Patch, Delete, Param, Query, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtPayload } from '../auth/strategies/jwt.strategy'
import { AdminService } from './admin.service'
import { AdminQueryDto } from './dto/admin-query.dto'
import { UpdateRoleDto } from './dto/update-role.dto'

@ApiTags('Admin')
@Controller({ path: 'admin', version: '1' })
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats') @ApiOperation({ summary: 'Platform overview stats' })
  getStats() { return this.adminService.getPlatformStats() }

  @Get('users') @ApiOperation({ summary: 'List users' })
  getUsers(@Query() query: AdminQueryDto) { return this.adminService.getUsers(query) }

  @Patch('users/:id/role') @ApiOperation({ summary: 'Change user role' })
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto, @CurrentUser() user: JwtPayload) { return this.adminService.updateUserRole(id, dto.role, user.sub) }

  @Delete('users/:id') @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Deactivate user' })
  deactivate(@Param('id') id: string, @CurrentUser() user: JwtPayload) { return this.adminService.deactivateUser(id, user.sub) }

  @Get('data-sources') @ApiOperation({ summary: 'Pipeline source status' })
  getDataSources() { return this.adminService.getDataSources() }

  @Get('audit-log') @ApiOperation({ summary: 'Paginated audit log' })
  getAuditLog(@Query() query: AdminQueryDto) { return this.adminService.getAuditLog(query) }
}
