import { BotDetectionService } from './bot-detection.service'

describe('BotDetectionService', () => {
  let service: BotDetectionService

  beforeEach(() => {
    service = new BotDetectionService()
  })

  describe('scoreMention', () => {
    it('scores clean human mention as low bot probability', () => {
      const result = service.scoreMention({
        content: 'I think the senator did a good job with the new education bill this session',
        publishedAt: new Date('2024-06-01'),
        likesCount: 45,
        sharesCount: 12,
        commentsCount: 8,
        accountAgedays: 1200,
        similarContentCount: 0,
      })
      expect(result.score).toBeLessThan(0.4)
      expect(result.signals).toBeDefined()
    })

    it('scores new account with high engagement and repetitive content as high bot probability', () => {
      const result = service.scoreMention({
        content: 'APC is best party vote APC #APC #VoteAPC2027 #NigeriaDecides #APC2027 #VoteRight',
        publishedAt: new Date(),
        likesCount: 5000,
        sharesCount: 3000,
        commentsCount: 2,
        accountAgedays: 3,
        similarContentCount: 45,
      })
      expect(result.score).toBeGreaterThan(0.6)
    })

    it('returns signals array describing detected patterns', () => {
      const result = service.scoreMention({
        content: 'vote vote vote #vote #vote2 #vote3',
        publishedAt: new Date(),
        likesCount: 0,
        sharesCount: 0,
        commentsCount: 0,
        accountAgedays: 5,
        similarContentCount: 30,
      })
      expect(result.signals.length).toBeGreaterThan(0)
    })

    it('caps score at 1.0', () => {
      const result = service.scoreMention({
        content: 'vote #a #b #c #d #e #f',
        publishedAt: new Date(),
        likesCount: 50000,
        sharesCount: 50000,
        commentsCount: 0,
        accountAgedays: 1,
        similarContentCount: 100,
      })
      expect(result.score).toBeLessThanOrEqual(1.0)
    })
  })

  describe('humanWeight', () => {
    it('returns 1.0 for score=0 (definitely human)', () => {
      expect(service.humanWeight(0)).toBe(1.0)
    })

    it('returns 0.0 for score=1.0 (definitely bot)', () => {
      expect(service.humanWeight(1.0)).toBe(0.0)
    })

    it('returns 0.5 for score=0.5 (uncertain)', () => {
      expect(service.humanWeight(0.5)).toBe(0.5)
    })
  })
})
