import { registerAs } from '@nestjs/config'

export default registerAs('throttle', () => ({
  short: {
    ttl: parseInt(process.env.THROTTLE_SHORT_TTL || '1000', 10),
    limit: parseInt(process.env.THROTTLE_SHORT_LIMIT || '10', 10),
  },
  medium: {
    ttl: parseInt(process.env.THROTTLE_MEDIUM_TTL || '60000', 10),
    limit: parseInt(process.env.THROTTLE_MEDIUM_LIMIT || '100', 10),
  },
}))
