import { Module } from '@nestjs/common'
import { LegislatureController } from './legislature.controller'
import { LegislatureService } from './legislature.service'

@Module({
  controllers: [LegislatureController],
  providers: [LegislatureService],
  exports: [LegislatureService],
})
export class LegislatureModule {}
