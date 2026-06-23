import { IsOptional, IsString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class TriggerJobDto {
  @ApiPropertyOptional({ description: 'Optional target (e.g., politician ID for targeted social fetch)' })
  @IsOptional()
  @IsString()
  targetId?: string
}
