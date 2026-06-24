import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { PoliticiansService } from './politicians.service'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { PusherService } from '../pusher/pusher.service'

describe('PoliticiansService', () => {
  let service: PoliticiansService

  const mockPrisma = {
    politician: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    corruptionCase: { count: jest.fn().mockResolvedValue(0) },
    auditLog: { create: jest.fn() },
    votingRecord: { findMany: jest.fn() },
    sponsoredBill: { findMany: jest.fn() },
    assetDeclaration: { findMany: jest.fn() },
    constituencyProject: { findMany: jest.fn() },
    partyDefection: { findMany: jest.fn() },
    careerEvent: { findMany: jest.fn() },
    committeeAssignment: { findMany: jest.fn() },
    socialMention: { findMany: jest.fn() },
    politicianSocialStats: { findUnique: jest.fn() },
  }

  const mockRedis = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
    getOrSet: jest.fn().mockImplementation((_key: string, fn: () => any) => fn()),
  }

  const mockPusher = {
    onPoliticianCreated: jest.fn().mockResolvedValue(undefined),
    onPoliticianUpdated: jest.fn().mockResolvedValue(undefined),
    triggerPublic: jest.fn().mockResolvedValue(undefined),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PoliticiansService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: PusherService, useValue: mockPusher },
      ],
    }).compile()

    service = module.get<PoliticiansService>(PoliticiansService)
  })

  afterEach(() => jest.clearAllMocks())

  describe('findBySlug', () => {
    it('should return politician when found', async () => {
      const mockPolitician = {
        id: 'uuid-1',
        slug: 'bola-tinubu',
        name: 'Bola Ahmed Tinubu',
        party: { abbreviation: 'APC', color: '#2563EB' },
        contacts: null,
        votingRecords: [],
        sponsoredBills: [],
        assetDeclarations: [],
        constituencyProjects: [],
        defections: [],
        careerEvents: [],
        committees: [],
        socialStats: null,
      }
      mockPrisma.politician.findFirst.mockResolvedValue(mockPolitician)

      const result = await service.findBySlug('bola-tinubu')

      expect(result).toEqual({ ...mockPolitician, corruptionCases: 0 })
      expect(mockPrisma.politician.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'bola-tinubu', isActive: true },
        }),
      )
    })

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.politician.findFirst.mockResolvedValue(null)
      await expect(service.findBySlug('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const mockData = [{ id: 'uuid-1', name: 'Test', party: { abbreviation: 'APC', color: '#blue' } }]
      mockPrisma.politician.findMany.mockResolvedValue(mockData)
      mockPrisma.politician.count.mockResolvedValue(1)

      const result = await service.findAll({ page: 1, limit: 20, skip: 0, sortOrder: 'asc' })

      expect(result.meta.total).toBe(1)
      expect(result.meta.totalPages).toBe(1)
      expect(result.data).toHaveLength(1)
    })

    it('should apply party filter', async () => {
      mockPrisma.politician.findMany.mockResolvedValue([])
      mockPrisma.politician.count.mockResolvedValue(0)

      await service.findAll({ page: 1, limit: 20, skip: 0, sortOrder: 'asc', party: 'APC' })

      expect(mockPrisma.politician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ party: { abbreviation: 'APC' } }),
        }),
      )
    })

    it('should apply search filter', async () => {
      mockPrisma.politician.findMany.mockResolvedValue([])
      mockPrisma.politician.count.mockResolvedValue(0)

      await service.findAll({ page: 1, limit: 20, skip: 0, sortOrder: 'asc', search: 'tinubu' })

      expect(mockPrisma.politician.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ OR: expect.any(Array) }),
        }),
      )
    })
  })

  describe('remove', () => {
    it('should soft-delete politician and clear cache', async () => {
      mockPrisma.politician.findUnique.mockResolvedValue({ id: 'uuid-1', slug: 'test', isActive: true })
      mockPrisma.politician.update.mockResolvedValue({ id: 'uuid-1', isActive: false })
      mockPrisma.auditLog.create.mockResolvedValue({})

      await service.remove('uuid-1', 'admin-id')

      expect(mockPrisma.politician.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { isActive: false },
      })
      expect(mockRedis.del).toHaveBeenCalled()
    })

    it('should throw NotFoundException if politician not found', async () => {
      mockPrisma.politician.findUnique.mockResolvedValue(null)
      await expect(service.remove('nonexistent', 'admin-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create politician with auto-generated slug', async () => {
      const dto = {
        name: 'Amaka Johnson',
        position: 'Senator',
        constituency: 'Lagos East',
        state: 'Lagos',
      }
      const created = { id: 'new-uuid', slug: 'amaka-johnson', ...dto }
      mockPrisma.politician.create.mockResolvedValue(created)
      mockPrisma.auditLog.create.mockResolvedValue({})

      const result = await service.create(dto as any, 'admin-id')

      expect(result).toEqual(created)
      expect(mockPrisma.politician.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ slug: 'amaka-johnson' }) }),
      )
    })
  })
})
