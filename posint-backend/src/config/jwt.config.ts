import { registerAs } from '@nestjs/config'

export default registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
  accessExpiresIn: '15m',
  refreshExpiresIn: '7d',
}))
