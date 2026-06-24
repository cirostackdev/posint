import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { PipelineController } from './pipeline.controller'
import { PipelineService } from './pipeline.service'
import { NassProcessor } from './processors/nass.processor'
import { EfccProcessor } from './processors/efcc.processor'
import { SocialProcessor } from './processors/social.processor'
import { SentimentProcessor } from './processors/sentiment.processor'
import { StatsProcessor } from './processors/stats.processor'
import { ReconcileProcessor } from './processors/reconcile.processor'
import { NassPlaywrightScraper } from './scrapers/nass-playwright.scraper'
import { EfccScraper } from './scrapers/efcc.scraper'
import { EfccPlaywrightScraper } from './scrapers/efcc-playwright.scraper'
import { InecScraper } from './scrapers/inec.scraper'
import { NewsRssScraper } from './scrapers/news-rss.scraper'
import { NewsProcessor } from './processors/news.processor'
import { AnomalyProcessor } from './processors/anomaly.processor'
import { AiService } from '../services/ai.service'
import { QUEUE_NAMES } from './pipeline.constants'

export { QUEUE_NAMES }

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host') || 'localhost',
          port: configService.get<number>('redis.port') || 6379,
          password: configService.get<string>('redis.password'),
          tls: configService.get<string>('redis.host') !== 'localhost' ? {} : undefined,
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_NAMES.SCRAPE_NASS },
      { name: QUEUE_NAMES.SCRAPE_EFCC },
      { name: QUEUE_NAMES.SCRAPE_INEC },
      { name: QUEUE_NAMES.FETCH_SOCIAL },
      { name: QUEUE_NAMES.FETCH_NEWS },
      { name: QUEUE_NAMES.COMPUTE_SENTIMENT },
      { name: QUEUE_NAMES.COMPUTE_STATS },
      { name: QUEUE_NAMES.WARM_CACHE },
      { name: QUEUE_NAMES.CLEANUP },
      { name: QUEUE_NAMES.RECONCILE_COUNTERS },
      { name: QUEUE_NAMES.SCAN_ANOMALIES },
    ),
  ],
  controllers: [PipelineController],
  providers: [
    PipelineService,
    NassProcessor,
    EfccProcessor,
    SocialProcessor,
    SentimentProcessor,
    StatsProcessor,
    ReconcileProcessor,
    NassPlaywrightScraper,
    EfccScraper,
    EfccPlaywrightScraper,
    InecScraper,
    NewsRssScraper,
    NewsProcessor,
    AnomalyProcessor,
    AiService,
  ],
  exports: [PipelineService],
})
export class PipelineModule {}
