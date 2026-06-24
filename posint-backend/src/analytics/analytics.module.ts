import { Module, Global } from '@nestjs/common'
import { AnomalyService } from './anomaly.service'
import { BotDetectionService } from './bot-detection.service'

@Global()
@Module({
  providers: [AnomalyService, BotDetectionService],
  exports: [AnomalyService, BotDetectionService],
})
export class AnalyticsModule {}
