import { Module, Global } from '@nestjs/common'
import { ProvenanceService } from './provenance.service'

@Global()
@Module({
  providers: [ProvenanceService],
  exports: [ProvenanceService],
})
export class ProvenanceModule {}
