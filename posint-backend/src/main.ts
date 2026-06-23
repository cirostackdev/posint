import { NestFactory } from '@nestjs/core'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)
  const port = configService.get<number>('app.port') ?? 4000
  const frontendUrl = configService.get<string>('app.frontendUrl') ?? 'http://localhost:3000'

  // CORS
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // Global prefix
  app.setGlobalPrefix('api')

  // URI versioning
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // Swagger
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('POSINT API')
      .setDescription('Nigerian Political OSINT Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addServer(`http://localhost:${port}`)
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document, {
      customCss: `
        body { background: #0f1117; }
        .swagger-ui { background: #0f1117; }
        .swagger-ui .topbar { background: #161b22; border-bottom: 1px solid #30363d; }
        .swagger-ui .topbar .download-url-wrapper .select-label { color: #e6edf3; }
        .swagger-ui .info .title, .swagger-ui .info p, .swagger-ui .info li,
        .swagger-ui .info a { color: #e6edf3; }
        .swagger-ui .info .base-url { color: #8b949e; }
        .swagger-ui .scheme-container { background: #161b22; box-shadow: none; border-bottom: 1px solid #30363d; }
        .swagger-ui select { background: #21262d; color: #e6edf3; border-color: #30363d; }
        .swagger-ui .opblock-tag { color: #e6edf3; border-bottom: 1px solid #30363d; }
        .swagger-ui .opblock-tag:hover { background: #161b22; }
        .swagger-ui .opblock { border: 1px solid #30363d; background: #161b22; }
        .swagger-ui .opblock .opblock-summary { border-bottom: 1px solid #30363d; }
        .swagger-ui .opblock .opblock-summary-operation-id,
        .swagger-ui .opblock .opblock-summary-path,
        .swagger-ui .opblock .opblock-summary-path__deprecated,
        .swagger-ui .opblock .opblock-summary-description { color: #e6edf3; }
        .swagger-ui .opblock.opblock-get { border-color: #1f6feb; background: rgba(31,111,235,0.08); }
        .swagger-ui .opblock.opblock-get .opblock-summary { border-color: #1f6feb; }
        .swagger-ui .opblock.opblock-post { border-color: #238636; background: rgba(35,134,54,0.08); }
        .swagger-ui .opblock.opblock-post .opblock-summary { border-color: #238636; }
        .swagger-ui .opblock.opblock-patch { border-color: #9e6a03; background: rgba(158,106,3,0.08); }
        .swagger-ui .opblock.opblock-patch .opblock-summary { border-color: #9e6a03; }
        .swagger-ui .opblock.opblock-delete { border-color: #b91c1c; background: rgba(185,28,28,0.08); }
        .swagger-ui .opblock.opblock-delete .opblock-summary { border-color: #b91c1c; }
        .swagger-ui .opblock-body { background: #0d1117; }
        .swagger-ui .opblock-description-wrapper p,
        .swagger-ui .opblock-external-docs-wrapper p,
        .swagger-ui .opblock-title_normal p { color: #8b949e; }
        .swagger-ui .tab li { color: #8b949e; }
        .swagger-ui .tab li.active { color: #e6edf3; }
        .swagger-ui textarea, .swagger-ui input[type=text],
        .swagger-ui input[type=email], .swagger-ui input[type=password] {
          background: #21262d; color: #e6edf3; border-color: #30363d;
        }
        .swagger-ui .btn { color: #e6edf3; border-color: #30363d; background: #21262d; }
        .swagger-ui .btn.authorize { background: #238636; border-color: #2ea043; color: #fff; }
        .swagger-ui .btn.execute { background: #1f6feb; border-color: #388bfd; color: #fff; }
        .swagger-ui .btn.cancel { background: #b91c1c; border-color: #da3633; color: #fff; }
        .swagger-ui .model-box { background: #161b22; border-color: #30363d; }
        .swagger-ui .model { color: #e6edf3; }
        .swagger-ui .model-title { color: #79c0ff; }
        .swagger-ui section.models { border-color: #30363d; background: #161b22; }
        .swagger-ui section.models h4 { color: #e6edf3; border-color: #30363d; }
        .swagger-ui .prop-type { color: #79c0ff; }
        .swagger-ui .prop-format { color: #8b949e; }
        .swagger-ui table thead tr th { color: #8b949e; border-color: #30363d; }
        .swagger-ui table tbody tr td { color: #e6edf3; border-color: #30363d; }
        .swagger-ui .response-col_status { color: #e6edf3; }
        .swagger-ui .response-col_description { color: #8b949e; }
        .swagger-ui .responses-inner h4, .swagger-ui .responses-inner h5 { color: #e6edf3; }
        .swagger-ui .highlight-code { background: #0d1117; }
        .swagger-ui .microlight { background: #0d1117 !important; color: #e6edf3; }
        .swagger-ui .parameter__name { color: #79c0ff; }
        .swagger-ui .parameter__type { color: #8b949e; }
        .swagger-ui .parameter__in { color: #8b949e; }
        .swagger-ui .markdown p, .swagger-ui .markdown li { color: #8b949e; }
        .swagger-ui .dialog-ux .modal-ux { background: #161b22; border-color: #30363d; }
        .swagger-ui .dialog-ux .modal-ux-header { border-color: #30363d; }
        .swagger-ui .dialog-ux .modal-ux-header h3 { color: #e6edf3; }
        .swagger-ui .auth-container { color: #e6edf3; }
        .swagger-ui .auth-container .wrapper { border-color: #30363d; }
        .swagger-ui .auth-container h4, .swagger-ui .auth-container h6 { color: #e6edf3; }
        .swagger-ui .auth-container .errors { background: rgba(185,28,28,0.1); border-color: #b91c1c; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #484f58; }
      `,
      customSiteTitle: 'POSINT API Docs',
    })
  }

  // Graceful shutdown
  app.enableShutdownHooks()

  await app.listen(port)
  console.log(`\n🚀 POSINT API running on: http://localhost:${port}/api/v1`)
  console.log(`📚 Swagger docs:           http://localhost:${port}/api/docs`)
  console.log(`❤️  Health check:           http://localhost:${port}/api/v1/health\n`)
}

bootstrap()
