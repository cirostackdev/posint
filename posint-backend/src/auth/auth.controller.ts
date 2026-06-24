import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { SignupDto } from './dto/signup.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'
import { Public } from '../common/decorators/public.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtPayload } from './strategies/jwt.strategy'
import { ThrottleLogin, ThrottleSignup, ThrottleRefresh } from '../common/decorators/throttle-auth.decorator'

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @Public()
  @ThrottleSignup()
  @ApiOperation({ summary: 'Create a new user account' })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto)
  }

  @Post('login')
  @Public()
  @ThrottleLogin()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate and receive tokens' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('refresh')
  @Public()
  @ThrottleRefresh()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken)
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate refresh token' })
  logout(@CurrentUser() user: JwtPayload) {
    return this.authService.logout(user.sub)
  }
}
