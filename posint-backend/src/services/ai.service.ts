import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface SentimentResult {
  label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  score: number
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)
  private openai: any

  constructor(private configService: ConfigService) {
    const apiKey = configService.get<string>('OPENAI_API_KEY')
    if (apiKey) {
      import('openai').then(({ default: OpenAI }) => {
        this.openai = new OpenAI({ apiKey })
      })
    } else {
      this.logger.warn('OpenAI API key not configured — sentiment analysis disabled')
    }
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    if (!this.openai) {
      return this.heuristicSentiment(text)
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'Analyze the sentiment of the following text about a Nigerian politician. ' +
              'Respond with JSON: { "label": "POSITIVE" | "NEGATIVE" | "NEUTRAL", "score": <float -1.0 to 1.0> }. ' +
              'score > 0 is positive, < 0 is negative, 0 is neutral.',
          },
          { role: 'user', content: text.slice(0, 500) },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 60,
      })

      const result = JSON.parse(response.choices[0].message.content || '{}')
      return {
        label: result.label || 'NEUTRAL',
        score: parseFloat(result.score) || 0,
      }
    } catch (err) {
      this.logger.error('Sentiment analysis failed:', err)
      return this.heuristicSentiment(text)
    }
  }

  private heuristicSentiment(text: string): SentimentResult {
    const lower = text.toLowerCase()
    const positiveWords = ['good', 'great', 'excellent', 'support', 'praise', 'success', 'achieve', 'development']
    const negativeWords = ['corrupt', 'bad', 'fail', 'steal', 'loot', 'crime', 'arrest', 'scandal', 'terrible']

    let score = 0
    for (const word of positiveWords) if (lower.includes(word)) score += 0.2
    for (const word of negativeWords) if (lower.includes(word)) score -= 0.2

    score = Math.max(-1, Math.min(1, score))
    const label = score > 0.1 ? 'POSITIVE' : score < -0.1 ? 'NEGATIVE' : 'NEUTRAL'
    return { label, score }
  }
}
