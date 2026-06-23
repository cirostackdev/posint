import { IsIn } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
export class UpdateRoleDto {
  @ApiProperty({ enum: ['USER','EDITOR','ADMIN'] })
  @IsIn(['USER','EDITOR','ADMIN'])
  role: string
}
