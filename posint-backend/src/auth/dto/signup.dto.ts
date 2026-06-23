import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SignupDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password: string

  @ApiPropertyOptional({ example: 'Amaka Johnson' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string
}
