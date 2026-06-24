import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { AnomalyService } from '../../analytics/anomaly.service'
import { PusherService } from '../../pusher/pusher.service'
import { QUEUE_NAMES } from '../pipeline.constants'

@Processor(QUEUE_NAMES.SCAN_ANOMALIES, { concurrency: 1 })
export class AnomalyProcessor extends WorkerHost {
  private readonly logger = new Logger(AnomalyProcessor.name)

  constructor(
    private anomalyService: AnomalyService,
    private pusher: PusherService,
  ) {
    super()
  }

  async process(job: Job) {
    this.logger.log('Starting anomaly scan...')
    const flags = await this.anomalyService.runFullScan()

    if (flags.length > 0) {
      this.logger.warn(`Anomaly scan found ${flags.length} flags`)
      await this.pusher.triggerAdmin('anomaly-flags-detected', {
        count: flags.length,
        highSeverity: flags.filter(f => f.severity === 'high').length,
        summary: flags.slice(0, 5).map(f => f.description),
      })
    }

    return { flagsDetected: flags.length }
  }
}
