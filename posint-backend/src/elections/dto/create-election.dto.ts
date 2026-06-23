import { IsInt, IsString, IsOptional, IsUUID, IsNumber, IsDateString, IsIn, Min, MaxLength, IsUrl } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateElectionDto {
  @ApiProperty({ example: 2023 })
  @IsInt()
  @Min(1960)
  year: number

  @ApiProperty({ example: 'Presidential' })
  @IsString()
  @MaxLength(100)
  type: string

  @ApiProperty({ enum: ['FEDERAL', 'STATE', 'LOCAL_GOVERNMENT', 'PARTY_PRIMARY'] })
  @IsIn(['FEDERAL', 'STATE', 'LOCAL_GOVERNMENT', 'PARTY_PRIMARY'])
  level: string

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
  ward?: string

  @ApiProperty({ example: 'Bola Ahmed Tinubu' })
  @IsString()
  @MaxLength(200)
  winnerName: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  winnerPartyId?: string

  @ApiProperty()
  @IsInt()
  @Min(0)
  winnerVotes: number

  @ApiProperty()
  @IsInt()
  @Min(0)
  totalVotes: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  registeredVoters?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  turnoutPct?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  margin?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  declaredDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  sourceUrl?: string
}
