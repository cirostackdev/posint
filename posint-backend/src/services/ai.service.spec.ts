import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { AiService } from './ai.service'

describe('AiService', () => {
  let service: AiService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(null) }, // No API key → heuristic mode
        },
      ],
    }).compile()
    service = module.get<AiService>(AiService)
  })

  describe('detectLanguage', () => {
    it('detects English', () => {
      expect(service.detectLanguage('The senator voted against the bill')).toBe('english')
    })

    it('detects Nigerian Pidgin', () => {
      expect(service.detectLanguage('Na dem dey chop money for that ministry')).toBe('pidgin')
    })

    it('detects Yoruba political terms', () => {
      expect(service.detectLanguage('Olori ilu ti pa owo ni')).toBe('yoruba')
    })

    it('returns unknown for very short text', () => {
      expect(service.detectLanguage('ok')).toBe('unknown')
    })
  })

  describe('heuristicSentiment (no API key)', () => {
    it('scores negative for corruption language', async () => {
      const result = await service.analyzeSentiment('This politician is corrupt and a thief who looted public funds')
      expect(result.value.label).toBe('NEGATIVE')
      expect(result.value.score).toBeLessThan(0)
    })

    it('scores negative for Pidgin corruption language', async () => {
      const result = await service.analyzeSentiment('Na dem dey chop our money, dem don loot the treasury finish')
      expect(result.value.label).toBe('NEGATIVE')
      expect(result.value.score).toBeLessThan(0)
    })

    it('scores positive for development language', async () => {
      const result = await service.analyzeSentiment('Great achievement, excellent roads built, development delivered')
      expect(result.value.label).toBe('POSITIVE')
      expect(result.value.score).toBeGreaterThan(0)
    })

    it('returns methodology=nlp_heuristic when no API key', async () => {
      const result = await service.analyzeSentiment('some text here')
      expect(result.methodology).toBe('nlp_heuristic')
    })
  })
})
