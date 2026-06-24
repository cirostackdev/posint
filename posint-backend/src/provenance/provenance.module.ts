import { Module, Global } from '@nestjs/common'
import { ProvenanceService } from './provenance.service'
import { ConfidenceService } from './confidence.service'
import { DataQualityService } from './data-quality.service'
import { ProvenanceController } from './provenance.controller'

@Global()
@Module({
  controllers: [ProvenanceController],
  providers: [ProvenanceService, ConfidenceService, DataQualityService],
  exports: [ProvenanceService, ConfidenceService, DataQualityService],
})
export class ProvenanceModule {}
