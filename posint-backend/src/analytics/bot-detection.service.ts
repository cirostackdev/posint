import { Injectable } from '@nestjs/common'
import { BotScore, BotSignal } from './analytics.types'

interface MentionFeatures {
  content: string
  publishedAt: Date
  likesCount: number
  sharesCount: number
  commentsCount: number
  accountAgedays: number
  similarContentCount: number
}

@Injectable()
export class BotDetectionService {
  /**
   * Score a social mention for bot probability.
   * 0.0 = definitely human, 1.0 = definitely bot.
   */
  scoreMention(features: MentionFeatures): BotScore {
    const signals: BotSignal[] = []
    let totalScore = 0

    // Signal 1: New account (weight: up to 0.3)
    if (features.accountAgedays < 30) {
      const w = 0.3 * Math.max(0, 1 - features.accountAgedays / 30)
      totalScore += w
      signals.push({ type: 'new_account', weight: w, description: `Account only ${features.accountAgedays} days old` })
    }

    // Signal 2: Coordinated content — many near-identical posts (weight: up to 0.35)
    if (features.similarContentCount > 10) {
      const w = Math.min(0.35, 0.35 * (features.similarContentCount / 50))
      totalScore += w
      signals.push({ type: 'coordinated_content', weight: w, description: `${features.similarContentCount} near-identical posts detected` })
    }

    // Signal 3: High engagement with no comments — likely inflated (weight: 0.2)
    const engagement = features.likesCount + features.sharesCount
    if (engagement > 1000 && features.commentsCount < 5) {
      totalScore += 0.2
      signals.push({ type: 'engagement_anomaly', weight: 0.2, description: `High engagement (${engagement}) with near-zero comments (${features.commentsCount})` })
    }

    // Signal 4: Excessive hashtags (weight: up to 0.1)
    const hashtagCount = (features.content.match(/#\w+/g) ?? []).length
    if (hashtagCount > 5) {
      const w = Math.min(0.1, 0.02 * hashtagCount)
      totalScore += w
      signals.push({ type: 'hashtag_spam', weight: w, description: `${hashtagCount} hashtags in single post` })
    }

    // Signal 5: Repetitive content — low lexical diversity (weight: up to 0.15)
    const words = features.content.toLowerCase().split(/\s+/)
    const uniqueWords = new Set(words)
    const repetitionRatio = uniqueWords.size / Math.max(words.length, 1)
    if (words.length > 5 && repetitionRatio < 0.5) {
      const w = 0.15 * (1 - repetitionRatio)
      totalScore += w
      signals.push({ type: 'repetitive_content', weight: w, description: `Low lexical diversity (${(repetitionRatio * 100).toFixed(0)}% unique words)` })
    }

    return {
      accountId: 'unknown',
      score: Math.min(1.0, totalScore),
      signals,
    }
  }

  /**
   * Convert bot score to human weight for sentiment calculation.
   * A score of 0.8 (likely bot) gives weight of 0.2 (barely counted).
   */
  humanWeight(botScore: number): number {
    return Math.max(0, 1 - botScore)
  }
}
