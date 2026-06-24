import { Injectable } from '@nestjs/common'

const SOURCE_TYPE_WEIGHTS: Record<string, number> = {
  official_gazette: 1.0,
  inec_official: 0.95,
  nass_official: 0.95,
  court_record: 0.95,
  efcc_press_release: 0.90,
  icpc_press_release: 0.90,
  ccb_declaration: 0.90,
  news_major_outlet: 0.70,
  news_minor_outlet: 0.50,
  social_media: 0.30,
  user_submission: 0.20,
}

@Injectable()
export class ConfidenceService {
  /**
   * Compute confidence score for a single fact from a single source.
   * score = sourceTypeWeight × recencyDecay × sourceReliability (capped at 1.0)
   */
  computeConfidence(sourceType: string, sourceDate: Date, sourceReliability: number): number {
    const typeWeight = SOURCE_TYPE_WEIGHTS[sourceType] ?? 0.30
    const daysSince = Math.max(0, (Date.now() - sourceDate.getTime()) / (1000 * 60 * 60 * 24))
    const recencyDecay = Math.exp(-0.001 * daysSince)
    const reliability = Math.max(0, Math.min(1, sourceReliability))
    return Math.min(1.0, typeWeight * recencyDecay * reliability)
  }

  /**
   * Apply triangulation bonus when multiple independent sources confirm a fact.
   * +0.1 per additional source beyond the first, capped at 1.0.
   */
  triangulate(baseConfidence: number, sourceCount: number): number {
    if (sourceCount <= 1) return baseConfidence
    const bonus = 0.1 * (sourceCount - 1)
    return Math.min(1.0, baseConfidence + bonus)
  }

  /**
   * Flag a fact for manual review when sources conflict significantly (>0.3 spread).
   */
  shouldFlagForReview(confidences: number[]): boolean {
    if (confidences.length < 2) return false
    const max = Math.max(...confidences)
    const min = Math.min(...confidences)
    return (max - min) > 0.3
  }
}
