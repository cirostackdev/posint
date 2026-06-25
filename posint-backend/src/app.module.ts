import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'

import appConfig from './config/app.config'
import databaseConfig from './config/database.config'
import redisConfig from './config/redis.config'
import jwtConfig from './config/jwt.config'
import pusherConfig from './config/pusher.config'
import throttleConfig from './config/throttle.config'

import { SentryModule } from './common/sentry/sentry.module'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { PusherModule } from './pusher/pusher.module'

import { AuthModule } from './auth/auth.module'
import { PoliticiansModule } from './politicians/politicians.module'
import { ElectionsModule } from './elections/elections.module'
import { LegislatureModule } from './legislature/legislature.module'
import { CorruptionModule } from './corruption/corruption.module'
import { PartiesModule } from './parties/parties.module'
import { CompareModule } from './compare/compare.module'
import { SocialModule } from './social/social.module'
import { SearchModule } from './search/search.module'
import { AdminModule } from './admin/admin.module'
import { PipelineModule } from './pipeline/pipeline.module'
import { ProxyModule } from './pipeline/proxy/proxy.module'
import { HealthModule } from './health/health.module'
import { WebhooksModule } from './webhooks/webhooks.module'
import { ProvenanceModule } from './provenance/provenance.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { ApiKeysModule } from './api-keys/api-keys.module'
import { CorrectionsModule } from './corrections/corrections.module'

import { AlertingMiddleware } from './common/middleware/alerting.middleware'
import { JwtAuthGuard } from './common/guards/jwt-auth.guard'
import { RolesGuard } from './common/guards/roles.guard'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'

@Module({
  imports: [
    // Config (global)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, jwtConfig, pusherConfig, throttleConfig],
    }),

    // Rate limiting (global)
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'medium', ttl: 60000, limit: 100 },
      { name: 'long', ttl: 3600000, limit: 1000 },
      { name: 'auth', ttl: 60000, limit: 100 },  // Auth endpoints use this; overridden per-route
    ]),

    // Observability (global, before everything else)
    SentryModule,

    // Infrastructure (global)
    PrismaModule,
    RedisModule,
    PusherModule,

    // Feature modules
    AuthModule,
    PoliticiansModule,
    ElectionsModule,
    LegislatureModule,
    CorruptionModule,
    PartiesModule,
    CompareModule,
    SocialModule,
    SearchModule,
    AdminModule,
    PipelineModule,
    ProxyModule,
    HealthModule,
    WebhooksModule,
    ProvenanceModule,
    AnalyticsModule,
    ApiKeysModule,
    CorrectionsModule,
  ],
  providers: [
    // Global guards
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },

    // Global filter
    { provide: APP_FILTER, useClass: HttpExceptionFilter },

    // Global interceptors
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AlertingMiddleware).forRoutes('*')
  }
}
