import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { AuthService } from './auth.service'
import { PrismaService } from '../prisma/prisma.service'

jest.mock('bcrypt')

describe('AuthService', () => {
  let service: AuthService

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    verify: jest.fn(),
  }

  const mockConfig = {
    get: jest.fn().mockReturnValue('mock-secret-key'),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  afterEach(() => jest.clearAllMocks())

  describe('signup', () => {
    it('should throw ConflictException for existing email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-id', email: 'test@test.com' })

      await expect(service.signup({ email: 'test@test.com', password: 'Pass123!!' }))
        .rejects.toThrow(ConflictException)
    })

    it('should create user and return tokens on new email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-uuid', email: 'new@test.com', role: 'USER', displayName: null,
      })
      mockPrisma.user.update.mockResolvedValue({})
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password')

      const result = await service.signup({ email: 'new@test.com', password: 'Pass123!!' })

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('refreshToken')
      expect(result.user.email).toBe('new@test.com')
      expect(result.user.role).toBe('USER')
    })
  })

  describe('login', () => {
    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)
      await expect(service.login({ email: 'nobody@test.com', password: 'pass' }))
        .rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException for inactive user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'id', isActive: false, passwordHash: 'hash' })
      await expect(service.login({ email: 'inactive@test.com', password: 'pass' }))
        .rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'uuid', email: 'test@test.com', passwordHash: 'hashed', isActive: true,
      })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(service.login({ email: 'test@test.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException)
    })

    it('should return tokens for valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'uuid', email: 'test@test.com', passwordHash: 'hashed', isActive: true,
        role: 'USER', displayName: 'Test User',
      })
      mockPrisma.user.update.mockResolvedValue({})
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-refresh')

      const result = await service.login({ email: 'test@test.com', password: 'correct' })

      expect(result).toHaveProperty('accessToken', 'mock-jwt-token')
      expect(result.user.email).toBe('test@test.com')
    })
  })

  describe('logout', () => {
    it('should clear refresh token', async () => {
      mockPrisma.user.update.mockResolvedValue({})
      await service.logout('user-id')
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-id' },
        data: { refreshToken: null },
      })
    })
  })
})
