import { IsString, IsOptional, IsUUID, IsIn, IsDateString, IsUrl, MaxLength, IsNumber, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateCaseDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() politicianId?: string
  @ApiProperty({ example: 'Orji Uzor Kalu' }) @IsString() @MaxLength(200) politicianName: string
  @ApiProperty({ enum: ['EFCC','ICPC','CCB','NFIU'] }) @IsIn(['EFCC','ICPC','CCB','NFIU']) agency: string
  @ApiPropertyOptional() @IsOptional() @IsString() caseNumber?: string
  @ApiProperty() @IsString() @MaxLength(1000) charges: string
  @ApiPropertyOptional({ description: 'Amount in kobo' }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0) amountInvolvedKobo?: number
  @ApiProperty({ enum: ['UNDER_INVESTIGATION','ONGOING','CONVICTED','ACQUITTED','DISMISSED','APPEALING'] }) @IsIn(['UNDER_INVESTIGATION','ONGOING','CONVICTED','ACQUITTED','DISMISSED','APPEALING']) status: string
  @ApiPropertyOptional() @IsOptional() @IsString() court?: string
  @ApiPropertyOptional() @IsOptional() @IsDateString() filingDate?: string
  @ApiPropertyOptional() @IsOptional() @IsDateString() verdictDate?: string
  @ApiPropertyOptional() @IsOptional() @IsString() sentence?: string
  @ApiProperty() @IsString() @MaxLength(5000) description: string
  @ApiPropertyOptional() @IsOptional() @IsUrl() sourceUrl?: string
}
