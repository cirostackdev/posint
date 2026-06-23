import { IsOptional, IsString, IsIn } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationDto } from '../../common/dto/pagination.dto'

export class QueryPoliticiansDto extends PaginationDto {
  @ApiPropertyOptional({ example: 'APC' })
  @IsOptional()
  @IsString()
  party?: string

  @ApiPropertyOptional({ example: 'Lagos' })
  @IsOptional()
  @IsString()
  state?: string

  @ApiPropertyOptional({ enum: ['SENATE', 'HOUSE_OF_REPRESENTATIVES'] })
  @IsOptional()
  @IsIn(['SENATE', 'HOUSE_OF_REPRESENTATIVES'])
  chamber?: string

  @ApiPropertyOptional({ example: 'bola tinubu' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    enum: ['name', 'attendanceRate', 'billsSponsored', 'yearsInOffice'],
    default: 'name',
  })
  @IsOptional()
  @IsIn(['name', 'attendanceRate', 'billsSponsored', 'yearsInOffice'])
  sortBy?: string = 'name'
}
