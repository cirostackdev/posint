import { Module, Global } from '@nestjs/common'
import { ProvenanceService } from './provenance.service'
import { ConfidenceService } from './confidence.service'
import { DataQualityService } from './data-quality.service'

@Global()
@Module({
  providers: [ProvenanceService, ConfidenceService, DataQualityService],
  exports: [ProvenanceService, ConfidenceService, DataQualityService],
})
export class ProvenanceModule {}
