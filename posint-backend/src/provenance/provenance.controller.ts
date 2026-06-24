import { Controller, Get, Param } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { Public } from '../common/decorators/public.decorator'
import { ProvenanceService } from './provenance.service'

@ApiTags('Provenance')
@Controller({ path: 'provenance', version: '1' })
export class ProvenanceController {
  constructor(private provenanceService: ProvenanceService) {}

  @Get(':entityType/:entityId/evidence')
  @Public()
  @ApiOperation({ summary: 'Get all source evidence for an entity' })
  getEvidence(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.provenanceService.getEvidence(entityType, entityId)
  }

  @Get(':entityType/:entityId/history')
  @Public()
  @ApiOperation({ summary: 'Get change history for an entity' })
  getHistory(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.provenanceService.getHistory(entityType, entityId)
  }
}
