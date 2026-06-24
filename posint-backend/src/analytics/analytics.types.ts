/**
 * Wrapper for all analytics outputs. Every intelligence result carries
 * confidence metadata so consumers know how much to trust the value.
 */
export interface AnalyticsResult<T> {
  value: T
  confidence: number        // 0.0-1.0
  sampleSize: number        // How many data points informed this result
  methodology: 'nlp_claude' | 'nlp_heuristic' | 'statistical' | 'rule_based'
  lastUpdated: Date
  caveats: string[]         // Known limitations (e.g. "limited Hausa data")
}

export interface SentimentResult {
  label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  score: number             // -1.0 to 1.0
  language: DetectedLanguage
}

export type DetectedLanguage = 'english' | 'pidgin' | 'hausa' | 'yoruba' | 'igbo' | 'unknown'

export interface AnomalyFlag {
  type: AnomalyType
  entityType: string
  entityId: string
  entityName: string
  description: string
  severity: 'low' | 'medium' | 'high'
  evidence: string
  detectedAt: Date
}

export type AnomalyType =
  | 'wealth_spike'
  | 'voting_pattern_break'
  | 'attendance_drop'
  | 'election_irregularity'
  | 'defection_signal'

export interface BotScore {
  accountId: string         // external platform ID or internal ID
  score: number             // 0.0 = definitely human, 1.0 = definitely bot
  signals: BotSignal[]
}

export interface BotSignal {
  type: string
  weight: number
  description: string
}
