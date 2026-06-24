import { DataQualityService } from './data-quality.service'

describe('DataQualityService', () => {
  let service: DataQualityService

  beforeEach(() => {
    service = new DataQualityService()
  })

  describe('validateAmount', () => {
    it('passes normal amounts (₦50M in kobo)', () => {
      const violations = service.validateAmount(5_000_000_000n) // ₦50M in kobo
      expect(violations).toHaveLength(0)
    })

    it('flags amounts over ₦100B', () => {
      const violations = service.validateAmount(10_000_000_000_001n) // just over ₦100B in kobo
      expect(violations).toHaveLength(1)
      expect(violations[0].rule).toBe('amount_sanity')
      expect(violations[0].severity).toBe('warning')
    })

    it('flags negative amounts', () => {
      const violations = service.validateAmount(-1n)
      expect(violations).toHaveLength(1)
      expect(violations[0].rule).toBe('negative_amount')
      expect(violations[0].severity).toBe('error')
    })

    it('passes null (no amount)', () => {
      const violations = service.validateAmount(null)
      expect(violations).toHaveLength(0)
    })
  })

  describe('validateDate', () => {
    it('passes valid past dates', () => {
      const violations = service.validateDate(new Date('2023-05-15'))
      expect(violations).toHaveLength(0)
    })

    it('flags future dates', () => {
      const future = new Date(Date.now() + 86400000)
      const violations = service.validateDate(future)
      expect(violations).toHaveLength(1)
      expect(violations[0].rule).toBe('future_date')
      expect(violations[0].severity).toBe('error')
    })

    it('flags dates before Nigerian independence (1960)', () => {
      const violations = service.validateDate(new Date('1959-12-31'))
      expect(violations).toHaveLength(1)
      expect(violations[0].rule).toBe('pre_independence_date')
    })

    it('passes null (no date)', () => {
      const violations = service.validateDate(null)
      expect(violations).toHaveLength(0)
    })
  })

  describe('validateSourceUrl', () => {
    it('passes valid HTTPS URLs', () => {
      const violations = service.validateSourceUrl('https://efcc.gov.ng/news/123')
      expect(violations).toHaveLength(0)
    })

    it('passes valid HTTP URLs', () => {
      const violations = service.validateSourceUrl('http://nass.gov.ng/bills/123')
      expect(violations).toHaveLength(0)
    })

    it('flags null/empty source URLs', () => {
      expect(service.validateSourceUrl(null)).toHaveLength(1)
      expect(service.validateSourceUrl(null)[0].rule).toBe('missing_source')
      expect(service.validateSourceUrl('')).toHaveLength(1)
    })

    it('flags non-http protocols', () => {
      const violations = service.validateSourceUrl('ftp://example.com')
      expect(violations).toHaveLength(1)
      expect(violations[0].rule).toBe('invalid_source_protocol')
      expect(violations[0].severity).toBe('error')
    })
  })

  describe('validateEntity', () => {
    it('aggregates violations across all fields', () => {
      const violations = service.validateEntity({
        amounts: [-1n],
        dates: [new Date('1959-01-01')],
        sourceUrls: [null],
      })
      expect(violations.length).toBeGreaterThanOrEqual(3)
    })

    it('passes clean entity', () => {
      const violations = service.validateEntity({
        amounts: [5_000_000_000n],
        dates: [new Date('2023-01-01')],
        sourceUrls: ['https://efcc.gov.ng/news/123'],
      })
      expect(violations).toHaveLength(0)
    })
  })
})
