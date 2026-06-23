import { IsOptional, IsString, IsIn } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationDto } from '../../common/dto/pagination.dto'

export class AdminQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string
  @ApiPropertyOptional({ enum: ['USER','EDITOR','ADMIN'] }) @IsOptional() @IsIn(['USER','EDITOR','ADMIN']) role?: string
}
