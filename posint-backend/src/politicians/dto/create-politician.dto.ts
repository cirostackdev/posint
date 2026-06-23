import {
  IsString, IsOptional, IsUUID, IsInt, IsNumber,
  IsDateString, IsIn, MinLength, MaxLength, Min, Max, IsUrl,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreatePoliticianDto {
  @ApiProperty({ example: 'Bola Ahmed Tinubu' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  partyId?: string

  @ApiProperty({ example: 'President' })
  @IsString()
  @MaxLength(150)
  position: string

  @ApiPropertyOptional({ enum: ['SENATE', 'HOUSE_OF_REPRESENTATIVES'] })
  @IsOptional()
  @IsIn(['SENATE', 'HOUSE_OF_REPRESENTATIVES'])
  chamber?: string

  @ApiProperty({ example: 'Lagos Island I' })
  @IsString()
  @MaxLength(200)
  constituency: string

  @ApiProperty({ example: 'Lagos' })
  @IsString()
  @MaxLength(100)
  state: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lga?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  photoUrl?: string

  @ApiPropertyOptional({ example: '1952-03-29' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string

  @ApiPropertyOptional({ enum: ['Male', 'Female'] })
  @IsOptional()
  @IsIn(['Male', 'Female'])
  gender?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  education?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  biography?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1960)
  @Max(2030)
  firstElected?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  yearsInOffice?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  attendanceRate?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  sourceUrl?: string
}
