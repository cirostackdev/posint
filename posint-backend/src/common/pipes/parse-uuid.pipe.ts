import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'

@Injectable()
export class ParseUuidPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(value)) {
      throw new BadRequestException(`${value} is not a valid UUID`)
    }
    return value
  }
}
