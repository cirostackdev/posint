import { Injectable, Logger } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'
import { Cron, CronExpression } from '@nestjs/schedule'
import { QUEUE_NAMES } from './pipeline.constants'

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name)

  private readonly defaultJobOptions = {
    attempts: 5,
    backoff: { type: 'exponential' as const, delay: 60000 },
    removeOnComplete: { age: 86400, count: 100 },
    removeOnFail: false, // Keep failures in queue for inspection
  }

  constructor(
    @InjectQueue(QUEUE_NAMES.SCRAPE_NASS) private nassQueue: Queue,
    @InjectQueue(QUEUE_NAMES.SCRAPE_EFCC) private efccQueue: Queue,
    @InjectQueue(QUEUE_NAMES.FETCH_SOCIAL) private socialQueue: Queue,
    @InjectQueue(QUEUE_NAMES.FETCH_NEWS) private newsQueue: Queue,
    @InjectQueue(QUEUE_NAMES.COMPUTE_SENTIMENT) private sentimentQueue: Queue,
    @InjectQueue(QUEUE_NAMES.COMPUTE_STATS) private statsQueue: Queue,
    @InjectQueue(QUEUE_NAMES.CLEANUP) private cleanupQueue: Queue,
    @InjectQueue(QUEUE_NAMES.RECONCILE_COUNTERS) private reconcileQueue: Queue,
  ) {}

  // ─── Scheduled Jobs ─────────────────────────────────────

  @Cron('0 6 * * *')
  async scheduleNassScrape() {
    this.logger.log('Scheduling NASS scrape')
    await this.nassQueue.add('scrape', {}, { jobId: `nass-${Date.now()}`, ...this.defaultJobOptions })
  }

  @Cron('0 */6 * * *')
  async scheduleEfccScrape() {
    await this.efccQueue.add('scrape', {}, { jobId: `efcc-${Date.now()}`, ...this.defaultJobOptions })
  }

  @Cron(CronExpression.EVERY_HOUR)
  async scheduleSocialFetch() {
    await this.socialQueue.add('fetch', {}, { jobId: `social-${Date.now()}`, ...this.defaultJobOptions })
  }

  @Cron('0 */2 * * *') // Every 2 hours
  async scheduleNewsFetch() {
    await this.newsQueue.add('fetch', {}, { jobId: `news-${Date.now()}`, ...this.defaultJobOptions })
  }

  @Cron('*/15 * * * *')
  async scheduleStatsCompute() {
    await this.statsQueue.add('compute', {}, { jobId: `stats-${Date.now()}`, ...this.defaultJobOptions })
  }

  @Cron('0 3 * * 0')
  async scheduleCleanup() {
    await this.cleanupQueue.add('cleanup', {}, { jobId: `cleanup-${Date.now()}`, ...this.defaultJobOptions })
  }

  @Cron('0 4 * * *') // Daily at 4am, after NASS scrape
  async scheduleReconcile() {
    await this.reconcileQueue.add('reconcile', {}, { jobId: `reconcile-${Date.now()}`, ...this.defaultJobOptions })
  }

  // ─── Manual Triggers ────────────────────────────────────

  async triggerNass() {
    const job = await this.nassQueue.add('scrape', { manual: true }, { priority: 1, ...this.defaultJobOptions })
    return { jobId: job.id, queue: QUEUE_NAMES.SCRAPE_NASS }
  }

  async triggerEfcc() {
    const job = await this.efccQueue.add('scrape', { manual: true }, { priority: 1, ...this.defaultJobOptions })
    return { jobId: job.id, queue: QUEUE_NAMES.SCRAPE_EFCC }
  }

  async triggerInec() {
    return { message: 'INEC trigger queued — manual review required for election data' }
  }

  async triggerSocial(targetId?: string) {
    const job = await this.socialQueue.add('fetch', { manual: true, targetId }, { priority: 1, ...this.defaultJobOptions })
    return { jobId: job.id, queue: QUEUE_NAMES.FETCH_SOCIAL }
  }

  async triggerNews() {
    const job = await this.newsQueue.add('fetch', { manual: true }, { priority: 1, ...this.defaultJobOptions })
    return { jobId: job.id, queue: QUEUE_NAMES.FETCH_NEWS }
  }

  async triggerSentiment() {
    const job = await this.sentimentQueue.add('compute', { manual: true }, { priority: 1, ...this.defaultJobOptions })
    return { jobId: job.id, queue: QUEUE_NAMES.COMPUTE_SENTIMENT }
  }

  async triggerStats() {
    const job = await this.statsQueue.add('compute', { manual: true }, { priority: 1, ...this.defaultJobOptions })
    return { jobId: job.id, queue: QUEUE_NAMES.COMPUTE_STATS }
  }

  async triggerReconcile() {
    const job = await this.reconcileQueue.add('reconcile', { manual: true }, { priority: 1, ...this.defaultJobOptions })
    return { jobId: job.id, queue: QUEUE_NAMES.RECONCILE_COUNTERS }
  }

  async getJobsStatus() {
    const [nassActive, nassCompleted, nassFailed] = await Promise.all([
      this.nassQueue.getActiveCount(),
      this.nassQueue.getCompletedCount(),
      this.nassQueue.getFailedCount(),
    ])
    const [efccActive, efccCompleted, efccFailed] = await Promise.all([
      this.efccQueue.getActiveCount(),
      this.efccQueue.getCompletedCount(),
      this.efccQueue.getFailedCount(),
    ])
    return {
      nass: { active: nassActive, completed: nassCompleted, failed: nassFailed },
      efcc: { active: efccActive, completed: efccCompleted, failed: efccFailed },
    }
  }
}
