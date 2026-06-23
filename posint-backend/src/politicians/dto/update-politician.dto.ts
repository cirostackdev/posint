import { PartialType } from '@nestjs/swagger'
import { CreatePoliticianDto } from './create-politician.dto'

export class UpdatePoliticianDto extends PartialType(CreatePoliticianDto) {}
