import { IsString, IsOptional, IsUUID, IsInt, IsIn, IsDateString, IsUrl, MaxLength, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateBillDto {
  @ApiProperty() @IsUUID() politicianId: string
  @ApiProperty() @IsString() @MaxLength(500) title: string
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(3000) summary?: string
  @ApiProperty({ enum: ['FIRST_READING','SECOND_READING','THIRD_READING','PASSED','REJECTED','WITHDRAWN'] })
  @IsIn(['FIRST_READING','SECOND_READING','THIRD_READING','PASSED','REJECTED','WITHDRAWN']) status: string
  @ApiProperty({ enum: ['SENATE', 'HOUSE_OF_REPRESENTATIVES'] })
  @IsIn(['SENATE', 'HOUSE_OF_REPRESENTATIVES']) chamber: string
  @ApiProperty({ example: '2024-03-15' }) @IsDateString() dateIntroduced: string
  @ApiPropertyOptional() @IsOptional() @IsDateString() datePassed?: string
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) coSponsors?: number
  @ApiPropertyOptional() @IsOptional() @IsUrl() fullTextUrl?: string
  @ApiPropertyOptional() @IsOptional() @IsUrl() sourceUrl?: string
}
