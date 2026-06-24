import { Test } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'

describe('CORS (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    process.env.NODE_ENV = 'production'
    process.env.FRONTEND_URL = 'https://posint.ng'
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()
    app = moduleFixture.createNestApplication()
    const frontendUrl = process.env.FRONTEND_URL
    app.enableCors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        const allowedOrigins = [frontendUrl]
        if (process.env.NODE_ENV !== 'production') {
          allowedOrigins.push('http://localhost:3000', 'http://localhost:3001')
        }
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error('CORS not allowed'))
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
    await app.init()
  }, 30000)

  afterAll(async () => {
    await app.close()
    process.env.NODE_ENV = 'development'
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
})
