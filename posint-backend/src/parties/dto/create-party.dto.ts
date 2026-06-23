import { IsString, IsOptional, IsInt, IsUrl, MaxLength, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreatePartyDto {
  @ApiProperty() @IsString() @MaxLength(200) name: string
  @ApiProperty() @IsString() @MaxLength(10) abbreviation: string
  @ApiProperty() @IsString() @MaxLength(50) slug: string
  @ApiPropertyOptional({ default: '#6B7280' }) @IsOptional() @IsString() color?: string
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1900) foundedYear?: number
  @ApiPropertyOptional() @IsOptional() @IsString() ideology?: string
  @ApiPropertyOptional() @IsOptional() @IsString() chairman?: string
  @ApiPropertyOptional() @IsOptional() @IsUrl() websiteUrl?: string
}
