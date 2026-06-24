import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { PublicStatsController } from './public-stats.controller'
import { AdminService } from './admin.service'

@Module({
  controllers: [AdminController, PublicStatsController],
  providers: [AdminService],
})
export class AdminModule {}
