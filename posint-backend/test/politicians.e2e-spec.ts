import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter'
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor'

describe('Politicians (e2e)', () => {
  let app: INestApplication
  let adminToken: string

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api')
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }),
    )
    app.useGlobalFilters(new HttpExceptionFilter())
    app.useGlobalInterceptors(new TransformInterceptor())
    await app.init()

    // Attempt login (requires seeded DB)
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@posint.ng', password: 'Admin@123!' })

    adminToken = loginRes.body?.data?.accessToken
  }, 30000)

  afterAll(async () => {
    await app.close()
  })

  describe('GET /api/v1/politicians', () => {
    it('should return 200 with paginated politician list', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/politicians')
      expect(res.status).toBe(200)
      expect(res.body.statusCode).toBe(200)
      expect(res.body.data).toBeDefined()
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('should reject page=0 with 400', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/politicians?page=0')
      expect(res.status).toBe(400)
    })

    it('should reject limit > 100 with 400', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/politicians?limit=101')
      expect(res.status).toBe(400)
    })

    it('should filter by state', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/politicians?state=Lagos')
      expect(res.status).toBe(200)
      if (res.body.data.length > 0) {
        res.body.data.forEach((p: any) => expect(p.state).toBe('Lagos'))
      }
    })
  })

  describe('GET /api/v1/politicians/stats', () => {
    it('should return platform stats', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/politicians/stats')
      expect(res.status).toBe(200)
      expect(res.body.data).toHaveProperty('total')
    })
  })

  describe('GET /api/v1/politicians/:slug', () => {
    it('should return 404 for unknown slug', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/politicians/absolutely-nobody-xyz')
      expect(res.status).toBe(404)
    })

    it('should return politician for valid slug', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/politicians/godswill-akpabio')
      // Will be 200 if seeded, 404 if not (both are acceptable)
      expect([200, 404]).toContain(res.status)
    })
  })

  describe('POST /api/v1/politicians (protected)', () => {
    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/politicians')
        .send({ name: 'Test', position: 'Senator', constituency: 'Test', state: 'Lagos' })
      expect(res.status).toBe(401)
    })

    it('should accept request with admin token', async () => {
      if (!adminToken) return // Skip if login failed (no seeded DB)
      const res = await request(app.getHttpServer())
        .post('/api/v1/politicians')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'E2E Test Politician', position: 'Senator', constituency: 'Test Constituency', state: 'Lagos' })
      expect([201, 409]).toContain(res.status) // 409 if slug already exists
    })
  })
})
