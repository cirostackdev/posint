import { AnomalyService } from './anomaly.service'

describe('AnomalyService', () => {
  let service: AnomalyService
  const mockPrisma = {
    assetDeclaration: { findMany: jest.fn() },
    politician: { findMany: jest.fn() },
    election: { findMany: jest.fn() },
  }

  beforeEach(() => {
    service = new AnomalyService(mockPrisma as any)
    jest.clearAllMocks()
  })

  describe('computeWealthGrowth', () => {
    it('flags when assets grow more than 200%', () => {
      const declarations = [
        { yearDeclared: 2019, estimatedValueKobo: '100000000000' },  // ₦1B
        { yearDeclared: 2023, estimatedValueKobo: '400000000000' },  // ₦4B (300% increase)
      ]
      const result = service.computeWealthGrowth(declarations)
      expect(result).not.toBeNull()
      expect(result!.flagged).toBe(true)
      expect(result!.growthPercent).toBeCloseTo(300)
    })

    it('does not flag normal asset growth (<= 200%)', () => {
      const declarations = [
        { yearDeclared: 2019, estimatedValueKobo: '100000000000' },
        { yearDeclared: 2023, estimatedValueKobo: '150000000000' }, // 50% increase
      ]
      const result = service.computeWealthGrowth(declarations)
      expect(result!.flagged).toBe(false)
    })

    it('returns null with fewer than 2 declarations', () => {
      expect(service.computeWealthGrowth([{ yearDeclared: 2023, estimatedValueKobo: '100000000000' }])).toBeNull()
      expect(service.computeWealthGrowth([])).toBeNull()
    })
  })

  describe('detectCrossPartyVoting', () => {
    it('returns max consecutive cross-party votes', () => {
      const records = [
        { vote: 'YES', partyVote: 'NO' },
        { vote: 'YES', partyVote: 'NO' },
        { vote: 'YES', partyVote: 'NO' },
        { vote: 'NO', partyVote: 'NO' },
      ]
      expect(service.detectCrossPartyVoting(records)).toBe(3)
    })

    it('returns 0 when voting aligns with party', () => {
      const records = [
        { vote: 'YES', partyVote: 'YES' },
        { vote: 'NO', partyVote: 'NO' },
      ]
      expect(service.detectCrossPartyVoting(records)).toBe(0)
    })
  })

  describe('flagElectionIrregularities', () => {
    it('flags turnout over 85%', () => {
      const flags = service.flagElectionIrregularities({
        turnoutPct: 91.5, winnerVotes: 9000, totalVotes: 10000,
        state: 'Kano', year: 2023, type: 'Governorship',
      })
      expect(flags).toContainEqual(expect.objectContaining({ type: 'high_turnout' }))
    })

    it('flags winner margin over 90%', () => {
      const flags = service.flagElectionIrregularities({
        turnoutPct: 50, winnerVotes: 9500, totalVotes: 10000,
        state: 'Lagos', year: 2023, type: 'Governorship',
      })
      expect(flags).toContainEqual(expect.objectContaining({ type: 'extreme_margin' }))
    })

    it('returns empty for normal elections', () => {
      const flags = service.flagElectionIrregularities({
        turnoutPct: 45, winnerVotes: 5200, totalVotes: 10000,
        state: 'Rivers', year: 2023, type: 'Governorship',
      })
      expect(flags).toHaveLength(0)
    })
  })
})
