import { Injectable } from '@nestjs/common'

export interface QualityViolation {
  rule: string
  severity: 'warning' | 'error'
  message: string
  value?: string
}

@Injectable()
export class DataQualityService {
  /**
   * Validate monetary amount in kobo.
   * Flags amounts over ₦100B (suspicious) or negative (impossible).
   */
  validateAmount(amountKobo: bigint | null): QualityViolation[] {
    const violations: QualityViolation[] = []
    if (amountKobo === null) return violations

    const hundredBillionKobo = 10_000_000_000_000n // ₦100B in kobo
    if (amountKobo > hundredBillionKobo) {
      violations.push({
        rule: 'amount_sanity',
        severity: 'warning',
        message: `Amount exceeds ₦100B threshold. Requires manual verification.`,
        value: amountKobo.toString(),
      })
    }

    if (amountKobo < 0n) {
      violations.push({
        rule: 'negative_amount',
        severity: 'error',
        message: 'Monetary amount cannot be negative',
        value: amountKobo.toString(),
      })
    }

    return violations
  }

  /**
   * Validate a date is reasonable for Nigerian political data.
   * Must be in the past and on or after Nigerian independence (1960-10-01).
   */
  validateDate(date: Date | null): QualityViolation[] {
    const violations: QualityViolation[] = []
    if (!date) return violations

    if (date > new Date()) {
      violations.push({
        rule: 'future_date',
        severity: 'error',
        message: `Date ${date.toISOString()} is in the future`,
        value: date.toISOString(),
      })
    }

    if (date < new Date('1960-10-01')) {
      violations.push({
        rule: 'pre_independence_date',
        severity: 'error',
        message: `Date ${date.toISOString()} is before Nigerian independence (1960-10-01)`,
        value: date.toISOString(),
      })
    }

    return violations
  }

  /**
   * Validate source URL is present and uses HTTP(S).
   */
  validateSourceUrl(url: string | null | undefined): QualityViolation[] {
    const violations: QualityViolation[] = []

    if (!url) {
      violations.push({
        rule: 'missing_source',
        severity: 'warning',
        message: 'No source URL provided — data point cannot be independently verified',
      })
      return violations
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      violations.push({
        rule: 'invalid_source_protocol',
        severity: 'error',
        message: `Source URL must use HTTP(S): ${url}`,
        value: url,
      })
    }

    return violations
  }

  /**
   * Run all validations on an entity and return all violations.
   */
  validateEntity(entity: {
    amounts?: (bigint | null)[]
    dates?: (Date | null)[]
    sourceUrls?: (string | null | undefined)[]
  }): QualityViolation[] {
    const violations: QualityViolation[] = []

    for (const amount of entity.amounts ?? []) {
      violations.push(...this.validateAmount(amount))
    }
    for (const date of entity.dates ?? []) {
      violations.push(...this.validateDate(date))
    }
    for (const url of entity.sourceUrls ?? []) {
      violations.push(...this.validateSourceUrl(url))
    }

    return violations
  }
}
