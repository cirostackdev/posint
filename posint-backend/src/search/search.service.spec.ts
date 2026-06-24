import { Test, TestingModule } from '@nestjs/testing'
import { SearchService } from './search.service'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'

describe('SearchService', () => {
  let service: SearchService

  const mockPrisma = {
    $queryRaw: jest.fn(),
    politician: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  }

  const mockRedis = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn(),
    getOrSet: jest.fn().mockImplementation((_key: string, fn: () => unknown) => fn()),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile()
    service = module.get<SearchService>(SearchService)
    jest.clearAllMocks()
  })

  it('should reject queries shorter than 2 chars', async () => {
    const result = await service.globalSearch('a')
    expect(result).toEqual([])
    expect(mockPrisma.$queryRaw).not.toHaveBeenCalled()
  })

  it('should return empty array for empty query', async () => {
    const result = await service.globalSearch('')
    expect(result).toEqual([])
  })

  it('should call $queryRaw with FTS for valid queries', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([])
    await service.globalSearch('Bola Tinubu')
    expect(mockPrisma.$queryRaw).toHaveBeenCalled()
  })

  it('should return fallback results when FTS returns fewer than 3 results', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([]) // FTS returns nothing
    mockPrisma.politician.findMany.mockResolvedValue([
      { id: 'uuid-1', slug: 'test-pol', name: 'Test Politician', position: 'Senator', state: 'Lagos' },
    ])
    const results = await service.globalSearch('Lagos')
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].entityType).toBe('politician')
  })
})
