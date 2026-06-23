import { IsOptional, IsString, IsIn, IsInt } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationDto } from '../../common/dto/pagination.dto'

export class QueryCasesDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ['EFCC','ICPC','CCB','NFIU'] }) @IsOptional() @IsIn(['EFCC','ICPC','CCB','NFIU']) agency?: string
  @ApiPropertyOptional({ enum: ['UNDER_INVESTIGATION','ONGOING','CONVICTED','ACQUITTED','DISMISSED','APPEALING'] }) @IsOptional() @IsIn(['UNDER_INVESTIGATION','ONGOING','CONVICTED','ACQUITTED','DISMISSED','APPEALING']) status?: string
  @ApiPropertyOptional({ example: 2023 }) @IsOptional() @Type(() => Number) @IsInt() year?: number
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string
}
