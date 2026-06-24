import { ConfidenceService } from './confidence.service'

describe('ConfidenceService', () => {
  let service: ConfidenceService

  beforeEach(() => {
    service = new ConfidenceService()
  })

  describe('computeConfidence', () => {
    it('gives highest confidence to official gazette', () => {
      const score = service.computeConfidence('official_gazette', new Date(), 1.0)
      expect(score).toBeCloseTo(1.0, 1)
    })

    it('gives lower confidence to social media', () => {
      const score = service.computeConfidence('social_media', new Date(), 1.0)
      expect(score).toBeLessThan(0.4)
    })

    it('applies recency decay for old sources', () => {
      const recent = service.computeConfidence('news_major_outlet', new Date(), 1.0)
      const old = service.computeConfidence('news_major_outlet', new Date('2020-01-01'), 1.0)
      expect(recent).toBeGreaterThan(old)
    })

    it('applies source reliability multiplier', () => {
      const reliable = service.computeConfidence('efcc_press_release', new Date(), 1.0)
      const unreliable = service.computeConfidence('efcc_press_release', new Date(), 0.5)
      expect(reliable).toBeGreaterThan(unreliable)
    })
  })

  describe('triangulate', () => {
    it('increases confidence with multiple independent sources', () => {
      const base = 0.7
      const triangulated = service.triangulate(base, 3)
      expect(triangulated).toBeGreaterThan(base)
      expect(triangulated).toBeLessThanOrEqual(1.0)
    })

    it('caps at 1.0', () => {
      const result = service.triangulate(0.95, 10)
      expect(result).toBe(1.0)
    })

    it('returns base with single source', () => {
      const result = service.triangulate(0.7, 1)
      expect(result).toBe(0.7)
    })
  })
})
