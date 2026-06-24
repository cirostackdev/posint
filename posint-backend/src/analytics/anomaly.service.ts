import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { AnomalyFlag } from './analytics.types'

interface AssetSnapshot {
  yearDeclared: number
  estimatedValueKobo: string
}

interface VotingEntry {
  vote: string
  partyVote: string
}

interface ElectionData {
  turnoutPct: number | null
  winnerVotes: number
  totalVotes: number
  state: string | null
  year: number
  type: string
}

@Injectable()
export class AnomalyService {
  private readonly logger = new Logger(AnomalyService.name)

  constructor(private prisma: PrismaService) {}

  /**
   * Compute wealth growth between earliest and latest asset declarations.
   * Flags when growth exceeds 200%. Returns null if fewer than 2 declarations.
   */
  computeWealthGrowth(
    declarations: AssetSnapshot[],
  ): { flagged: boolean; growthPercent: number; earliest: AssetSnapshot; latest: AssetSnapshot } | null {
    if (declarations.length < 2) return null

    const sorted = [...declarations].sort((a, b) => a.yearDeclared - b.yearDeclared)
    const earliest = sorted[0]
    const latest = sorted[sorted.length - 1]

    const earliestVal = BigInt(earliest.estimatedValueKobo)
    const latestVal = BigInt(latest.estimatedValueKobo)

    if (earliestVal === 0n) return null

    const growthPercent = Number(((latestVal - earliestVal) * 100n) / earliestVal)

    return {
      flagged: growthPercent > 200,
      growthPercent,
      earliest,
      latest,
    }
  }

  /**
   * Count the maximum consecutive cross-party votes.
   * Excludes ABSENT and ABSTAIN as non-votes.
   */
  detectCrossPartyVoting(records: VotingEntry[]): number {
    let maxConsecutive = 0
    let current = 0

    for (const record of records) {
      if (
        record.vote !== record.partyVote &&
        record.vote !== 'ABSENT' &&
        record.vote !== 'ABSTAIN'
      ) {
        current++
        maxConsecutive = Math.max(maxConsecutive, current)
      } else {
        current = 0
      }
    }

    return maxConsecutive
  }

  /**
   * Flag statistical irregularities in election results.
   */
  flagElectionIrregularities(election: ElectionData): Array<{ type: string; message: string }> {
    const flags: Array<{ type: string; message: string }> = []

    if (election.turnoutPct !== null && election.turnoutPct > 85) {
      flags.push({
        type: 'high_turnout',
        message: `Turnout of ${election.turnoutPct}% exceeds 85% threshold in ${election.state ?? 'Federal'} (${election.year} ${election.type})`,
      })
    }

    const marginPct = election.totalVotes > 0
      ? (election.winnerVotes / election.totalVotes) * 100
      : 0

    if (marginPct > 90) {
      flags.push({
        type: 'extreme_margin',
        message: `Winner received ${marginPct.toFixed(1)}% of total votes in ${election.state ?? 'Federal'} (${election.year} ${election.type})`,
      })
    }

    return flags
  }

  /**
   * Run full anomaly scan across active politicians and elections.
   */
  async runFullScan(): Promise<AnomalyFlag[]> {
    const flags: AnomalyFlag[] = []
    const now = new Date()

    const politicians = await this.prisma.politician.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
    })

    for (const politician of politicians) {
      const assets = await this.prisma.assetDeclaration.findMany({
        where: { politicianId: politician.id },
        select: { yearDeclared: true, estimatedValueKobo: true },
        orderBy: { yearDeclared: 'asc' },
      })

      const growth = this.computeWealthGrowth(
        assets.map(a => ({
          yearDeclared: a.yearDeclared,
          estimatedValueKobo: a.estimatedValueKobo.toString(),
        }))
      )

      if (growth?.flagged) {
        const latestKobo = Number(BigInt(growth.latest.estimatedValueKobo))
        const earliestKobo = Number(BigInt(growth.earliest.estimatedValueKobo))
        flags.push({
          type: 'wealth_spike',
          entityType: 'politician',
          entityId: politician.id,
          entityName: politician.name,
          description: `Assets grew ${growth.growthPercent.toFixed(0)}% from ₦${(earliestKobo / 100e6).toFixed(1)}M to ₦${(latestKobo / 100e6).toFixed(1)}M`,
          severity: growth.growthPercent > 500 ? 'high' : 'medium',
          evidence: `Declarations: ${growth.earliest.yearDeclared} → ${growth.latest.yearDeclared}`,
          detectedAt: now,
        })
      }
    }

    const elections = await this.prisma.election.findMany({
      select: { id: true, type: true, year: true, state: true, turnoutPct: true, winnerVotes: true, totalVotes: true },
    })

    for (const election of elections) {
      const irregularities = this.flagElectionIrregularities({
        turnoutPct: election.turnoutPct ? Number(election.turnoutPct) : null,
        winnerVotes: election.winnerVotes,
        totalVotes: election.totalVotes,
        state: election.state,
        year: election.year,
        type: election.type,
      })

      for (const irregularity of irregularities) {
        flags.push({
          type: 'election_irregularity',
          entityType: 'election',
          entityId: election.id,
          entityName: `${election.type} ${election.year} — ${election.state ?? 'Federal'}`,
          description: irregularity.message,
          severity: 'medium',
          evidence: `Turnout: ${election.turnoutPct}%, Winner: ${((election.winnerVotes / election.totalVotes) * 100).toFixed(1)}% of votes`,
          detectedAt: now,
        })
      }
    }

    this.logger.log(`Anomaly scan complete: ${flags.length} flags detected`)
    return flags
  }
}
