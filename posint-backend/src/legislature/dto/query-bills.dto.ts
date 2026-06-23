import { IsOptional, IsString, IsIn, IsUUID } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationDto } from '../../common/dto/pagination.dto'

export class QueryBillsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['FIRST_READING','SECOND_READING','THIRD_READING','PASSED','REJECTED','WITHDRAWN'] })
  @IsOptional()
  @IsIn(['FIRST_READING','SECOND_READING','THIRD_READING','PASSED','REJECTED','WITHDRAWN'])
  status?: string

  @ApiPropertyOptional({ enum: ['SENATE', 'HOUSE_OF_REPRESENTATIVES'] })
  @IsOptional()
  @IsIn(['SENATE', 'HOUSE_OF_REPRESENTATIVES'])
  chamber?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sponsorId?: string
}
