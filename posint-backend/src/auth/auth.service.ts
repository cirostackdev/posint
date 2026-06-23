import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { SignupDto } from './dto/signup.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('Email already registered')

    const passwordHash = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.user.create({
      data: { email: dto.email, passwordHash, displayName: dto.displayName, role: 'USER' },
    })

    const tokens = await this.generateTokens(user.id, user.email, user.role)
    await this.storeRefreshToken(user.id, tokens.refreshToken)

    return {
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
      ...tokens,
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials')

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials')

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const tokens = await this.generateTokens(user.id, user.email, user.role)
    await this.storeRefreshToken(user.id, tokens.refreshToken)

    return {
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
      ...tokens,
    }
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      })

      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } })
      if (!user || !user.isActive) throw new UnauthorizedException()

      const tokenValid = await bcrypt.compare(refreshToken, user.refreshToken || '')
      if (!tokenValid) throw new UnauthorizedException('Refresh token invalid or already used')

      const tokens = await this.generateTokens(user.id, user.email, user.role)
      await this.storeRefreshToken(user.id, tokens.refreshToken)

      return tokens
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    })
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: '7d',
      }),
    ])

    return { accessToken, refreshToken }
  }

  private async storeRefreshToken(userId: string, refreshToken: string) {
    const hashed = await bcrypt.hash(refreshToken, 10)
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashed },
    })
  }
}
