import { Test, TestingModule } from '@nestjs/testing'
import { ProvenanceService } from './provenance.service'
import { PrismaService } from '../prisma/prisma.service'

describe('ProvenanceService', () => {
  let service: ProvenanceService
  const mockPrisma = {
    sourceRecord: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    factSource: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    factHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProvenanceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()
    service = module.get<ProvenanceService>(ProvenanceService)
  })

  afterEach(() => jest.clearAllMocks())

  describe('hashContent', () => {
    it('produces consistent SHA-256 hash', () => {
      const hash1 = service.hashContent('<html>hello</html>')
      const hash2 = service.hashContent('<html>hello</html>')
      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(64)
    })

    it('produces different hash for different content', () => {
      const hash1 = service.hashContent('content A')
      const hash2 = service.hashContent('content B')
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('recordSource', () => {
    it('creates source record with hash', async () => {
      mockPrisma.sourceRecord.findFirst.mockResolvedValue(null)
      mockPrisma.sourceRecord.create.mockResolvedValue({ id: 'src-1', contentHash: 'abc123' })

      const result = await service.recordSource({
        url: 'https://efcc.gov.ng/news/123',
        content: '<html>case details</html>',
        contentType: 'html',
      })

      expect(result.id).toBe('src-1')
      expect(mockPrisma.sourceRecord.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            url: 'https://efcc.gov.ng/news/123',
            contentType: 'html',
          }),
        }),
      )
    })

    it('returns existing record if content hash matches', async () => {
      mockPrisma.sourceRecord.findFirst.mockResolvedValue({ id: 'existing-1', contentHash: 'abc' })

      const result = await service.recordSource({
        url: 'https://efcc.gov.ng/news/123',
        content: '<html>same content</html>',
        contentType: 'html',
      })

      expect(result.id).toBe('existing-1')
      expect(mockPrisma.sourceRecord.create).not.toHaveBeenCalled()
    })
  })

  describe('linkFact', () => {
    it('creates fact_source linking entity to source record', async () => {
      mockPrisma.factSource.create.mockResolvedValue({ id: 'fs-1' })

      await service.linkFact({
        entityType: 'politician',
        entityId: 'pol-123',
        fieldName: 'billsSponsored',
        sourceRecordId: 'src-1',
        extractionMethod: 'scraper_css',
        extractedText: '45 bills',
        confidence: 0.95,
      })

      expect(mockPrisma.factSource.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            entityType: 'politician',
            entityId: 'pol-123',
            confidence: 0.95,
          }),
        }),
      )
    })
  })

  describe('recordChange', () => {
    it('creates fact_history entry', async () => {
      mockPrisma.factHistory.create.mockResolvedValue({ id: 'fh-1' })

      await service.recordChange({
        entityType: 'politician',
        entityId: 'pol-123',
        fieldName: 'attendanceRate',
        oldValue: '85.0',
        newValue: '91.5',
        sourceRecordId: 'src-1',
        changeReason: 'scraper_update',
      })

      expect(mockPrisma.factHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fieldName: 'attendanceRate',
            oldValue: '85.0',
            newValue: '91.5',
          }),
        }),
      )
    })
  })
})
