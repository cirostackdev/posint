import { Module } from '@nestjs/common'
import { CorruptionController } from './corruption.controller'
import { CorruptionService } from './corruption.service'

@Module({
  controllers: [CorruptionController],
  providers: [CorruptionService],
  exports: [CorruptionService],
})
export class CorruptionModule {}
