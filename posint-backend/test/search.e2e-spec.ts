import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter'
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor'

describe('Search (e2e)', () => {
  let app: INestApplication

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
  }, 30000)

  afterAll(async () => {
    await app.close()
  })

  describe('GET /api/v1/search', () => {
    it('should return 400 for query shorter than 2 chars', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/search?q=a')
      expect(res.status).toBe(400)
    })

    it('should return 400 for empty query', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/search?q=')
      expect(res.status).toBe(400)
    })

    it('should return 200 with array for valid query', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/search?q=tinubu')
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('should return 200 for multi-word query', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/search?q=senate%20president')
      expect(res.status).toBe(200)
    })

    it('should respect limit parameter', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/search?q=nigeria&limit=3')
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body.data)).toBe(true)
    })

    it('should return results with entityType field', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/search?q=akpabio')
      expect(res.status).toBe(200)
      if (res.body.data.length > 0) {
        expect(res.body.data[0]).toHaveProperty('entityType')
        expect(res.body.data[0]).toHaveProperty('entityId')
        expect(res.body.data[0]).toHaveProperty('title')
      }
    })
  })
})
