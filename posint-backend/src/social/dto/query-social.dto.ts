import { IsOptional, IsString, IsIn, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class QuerySocialDto {
  @ApiPropertyOptional({ enum: ['TWITTER','FACEBOOK','INSTAGRAM','TIKTOK','YOUTUBE'] })
  @IsOptional()
  @IsIn(['TWITTER','FACEBOOK','INSTAGRAM','TIKTOK','YOUTUBE'])
  platform?: string

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  from?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  to?: string
}
