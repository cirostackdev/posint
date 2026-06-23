import { IsOptional, IsString, IsInt, IsIn } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationDto } from '../../common/dto/pagination.dto'

export class QueryElectionsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['FEDERAL', 'STATE', 'LOCAL_GOVERNMENT', 'PARTY_PRIMARY'] })
  @IsOptional()
  @IsIn(['FEDERAL', 'STATE', 'LOCAL_GOVERNMENT', 'PARTY_PRIMARY'])
  level?: string

  @ApiPropertyOptional({ example: 2023 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lga?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  party?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string
}
