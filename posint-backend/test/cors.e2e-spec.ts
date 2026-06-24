import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { buildCorsOrigins, corsOriginCallback } from '../src/config/cors.config'

describe('CORS (e2e)', () => {
  let app: INestApplication
  let originalNodeEnv: string | undefined

  beforeAll(async () => {
    originalNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    process.env.FRONTEND_URL = 'https://posint.ng'

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    app = moduleFixture.createNestApplication()

    const allowedOrigins = buildCorsOrigins('https://posint.ng', 'production')
    app.enableCors({
      origin: corsOriginCallback(allowedOrigins),
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })

    await app.init()
  }, 30000)

  afterAll(async () => {
    await app.close()
    process.env.NODE_ENV = originalNodeEnv
  })

  it('should allow requests from FRONTEND_URL in production', async () => {
    const res = await request(app.getHttpServer())
      .options('/api/v1/health')
      .set('Origin', 'https://posint.ng')
    expect(res.headers['access-control-allow-origin']).toBe('https://posint.ng')
  })

  it('should reject requests from localhost in production', async () => {
    const res = await request(app.getHttpServer())
      .options('/api/v1/health')
      .set('Origin', 'http://localhost:3000')
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })

  it('should allow requests with no Origin header (server-to-server)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/health')
    // No Origin header set — should succeed (no CORS rejection)
    expect(res.status).not.toBe(403)
  })
})
