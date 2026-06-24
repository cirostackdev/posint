import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Anthropic from '@anthropic-ai/sdk'
import {
  AnalyticsResult,
  SentimentResult,
  DetectedLanguage,
} from '../analytics/analytics.types'

// ─── Nigerian Political Vocabulary ─────────────────────────────
const NIGERIAN_NEGATIVE: string[] = [
  // English
  'corrupt', 'corruption', 'loot', 'looted', 'looting', 'steal', 'stolen', 'theft',
  'fraud', 'fraudulent', 'embezzle', 'embezzlement', 'bribe', 'bribery',
  'scandal', 'criminal', 'arrested', 'arraigned', 'charged',
  'sentence', 'convicted', 'guilty', 'illegal', 'unlawful', 'diversion',
  'misappropriation', 'incompetent', 'failure', 'failed', 'disappointing',
  'terrible', 'bad', 'poor', 'worst', 'shameful', 'disgrace', 'useless',
  // Nigerian Pidgin
  'chop money', 'chop public money', 'chop our money', 'dem dey steal',
  'e don run', 'na thief', '419', 'dem don carry', 'oga don take',
  'gbege', 'wahala', 'palava', 'yawa don gas',
  // Hausa
  'sata', 'fashi', 'cin hanci', 'rashawa', 'almundahana', 'damfara',
  // Yoruba
  'ole', 'jibiti', 'osi', 'ipalara', 'ika',
  // Igbo
  'ohi', 'ajọ ihe',
]

const NIGERIAN_POSITIVE: string[] = [
  // English
  'development', 'progress', 'achievement', 'deliver', 'delivered', 'success',
  'successful', 'excellent', 'great', 'good', 'praise', 'commend', 'applaud',
  'infrastructure', 'road', 'hospital', 'school', 'electricity', 'water',
  'jobs', 'employment', 'invest', 'investment', 'improve', 'improvement',
  'accountability', 'transparent', 'integrity', 'honest', 'dedicated',
  // Nigerian Pidgin
  'e don do well', 'e deliver', 'correct guy', 'him do am', 'thumbs up',
  'correct work', 'this one different',
  // Hausa
  'ci gaba', 'nasara', 'kyakkyawa', 'aiki mai kyau',
  // Yoruba
  'idagbasoke', 'dara', 'ise rere',
  // Igbo
  'ihe ọma',
]

// ─── Language Detection Vocabulary ─────────────────────────────
const PIDGIN_MARKERS = ['dem', 'na', 'dey', 'don', 'wahala', 'wetin', 'abi', 'sha', 'oga', 'chop', 'carry go', 'gbege']
const HAUSA_MARKERS = ['da', 'wanda', 'yana', 'tana', 'suna', 'kuma', 'saboda', 'domin', 'amma']
const YORUBA_MARKERS = ['ti', 'ni', 'ko', 'ati', 'pe', 'lati', 'fun', 'rẹ', 'wọn']
const IGBO_MARKERS = ['nke', 'ọ', 'ha', 'maka', 'ebe', 'ka', 'ihe']

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)
  private client: Anthropic | null = null

  constructor(private configService: ConfigService) {
    const apiKey = configService.get<string>('ANTHROPIC_API_KEY')
      || configService.get<string>('OPENAI_API_KEY') // legacy compat
    if (apiKey && apiKey.startsWith('sk-ant-')) {
      this.client = new Anthropic({ apiKey })
      this.logger.log('Anthropic API configured — using Claude for NLP')
    } else {
      this.logger.warn('No Anthropic API key — falling back to Nigerian heuristic NLP')
    }
  }

  /**
   * Detect the language of a text snippet.
   * Returns 'english' as default when no strong signal found.
   */
  detectLanguage(text: string): DetectedLanguage {
    if (!text || text.trim().length < 5) return 'unknown'
    const lower = text.toLowerCase()
    const words = lower.split(/\s+/)

    const score = (markers: string[]) =>
      markers.filter(m => {
        // Use whole-word matching for single-word markers to avoid substring false positives
        if (!m.includes(' ')) return words.includes(m)
        return lower.includes(m)
      }).length / Math.max(words.length, 1)

    const scores: Record<DetectedLanguage, number> = {
      english: 0,
      pidgin: score(PIDGIN_MARKERS) * 3,
      hausa: score(HAUSA_MARKERS) * 2,
      yoruba: score(YORUBA_MARKERS) * 2,
      igbo: score(IGBO_MARKERS) * 2,
      unknown: 0,
    }

    const maxScore = Math.max(...Object.values(scores))
    if (maxScore < 0.05) return 'english'

    return Object.entries(scores).sort(([, a], [, b]) => b - a)[0][0] as DetectedLanguage
  }

  /**
   * Analyze sentiment using Claude API (primary) or Nigerian heuristic (fallback).
   * Returns an AnalyticsResult with confidence metadata.
   */
  async analyzeSentiment(text: string): Promise<AnalyticsResult<SentimentResult>> {
    const language = this.detectLanguage(text)
    const caveats: string[] = []

    if (language !== 'english') caveats.push(`Text detected as ${language} — accuracy may vary`)
    if (text.length < 20) caveats.push('Short text may produce unreliable sentiment')

    if (this.client) return this.claudeSentiment(text, language, caveats)
    return this.heuristicSentiment(text, language, caveats)
  }

  private async claudeSentiment(
    text: string,
    language: DetectedLanguage,
    caveats: string[],
  ): Promise<AnalyticsResult<SentimentResult>> {
    try {
      const message = await this.client!.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `Analyze the sentiment of this Nigerian political text (may be English, Pidgin, Hausa, Yoruba, or Igbo).
Respond with ONLY valid JSON: {"label":"POSITIVE"|"NEGATIVE"|"NEUTRAL","score":<float -1.0 to 1.0>}

Text: ${text.slice(0, 500)}`,
        }],
      })

      const raw = (message.content[0] as { text: string }).text?.trim() ?? '{}'
      const parsed = JSON.parse(raw)

      return {
        value: { label: parsed.label ?? 'NEUTRAL', score: parseFloat(parsed.score) || 0, language },
        confidence: 0.85,
        sampleSize: 1,
        methodology: 'nlp_claude',
        lastUpdated: new Date(),
        caveats,
      }
    } catch (err: any) {
      this.logger.error(`Claude sentiment failed: ${err.message}`)
      return this.heuristicSentiment(text, language, [...caveats, 'API error — fell back to heuristic'])
    }
  }

  private heuristicSentiment(
    text: string,
    language: DetectedLanguage,
    caveats: string[],
  ): AnalyticsResult<SentimentResult> {
    const lower = text.toLowerCase()
    let score = 0

    for (const term of NIGERIAN_POSITIVE) { if (lower.includes(term)) score += 0.15 }
    for (const term of NIGERIAN_NEGATIVE) { if (lower.includes(term)) score -= 0.15 }

    score = Math.max(-1, Math.min(1, score))
    const label = score > 0.1 ? 'POSITIVE' : score < -0.1 ? 'NEGATIVE' : 'NEUTRAL'

    return {
      value: { label, score, language },
      confidence: 0.55,
      sampleSize: 1,
      methodology: 'nlp_heuristic',
      lastUpdated: new Date(),
      caveats: [...caveats, 'Heuristic model — limited accuracy for complex sentences'],
    }
  }
}
