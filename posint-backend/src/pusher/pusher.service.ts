import { Injectable, Inject, Logger, Optional, ForbiddenException } from '@nestjs/common'

export interface PoliticianUpdatedEvent {
  id: string
  slug: string
  field?: string
}

export interface BillStatusChangedEvent {
  id: string
  title: string
  oldStatus: string
  newStatus: string
}

export interface CaseStatusChangedEvent {
  id: string
  politicianName: string
  agency: string
  newStatus: string
}

export interface ElectionDeclaredEvent {
  id: string
  type: string
  year: number
  level: string
  winnerName: string
  winnerParty?: string
}

export interface PipelineJobEvent {
  jobType: string
  recordsProcessed?: number
  error?: string
  duration?: number
}

@Injectable()
export class PusherService {
  private readonly logger = new Logger(PusherService.name)

  constructor(@Optional() @Inject('PUSHER_CLIENT') private pusher: any) {
    if (!pusher) {
      this.logger.warn('Pusher client not configured — real-time disabled')
    }
  }

  // ─── Public events ─────────────────────────────────────

  async onPoliticianCreated(data: Pick<PoliticianUpdatedEvent, 'id' | 'slug'>) {
    await this.trigger('posint-public', 'politician-created', data)
  }

  async onPoliticianUpdated(data: PoliticianUpdatedEvent) {
    await this.trigger('posint-public', 'politician-updated', data)
  }

  async onNewBillIntroduced(data: { id: string; title: string; sponsor: string; chamber: string }) {
    await this.trigger('posint-public', 'new-bill-introduced', data)
  }

  async onBillStatusChanged(data: BillStatusChangedEvent) {
    await this.trigger('posint-public', 'bill-status-changed', data)
  }

  async onCaseStatusChanged(data: CaseStatusChangedEvent) {
    await this.trigger('posint-public', 'case-status-changed', data)
  }

  async onElectionDeclared(data: ElectionDeclaredEvent) {
    await this.trigger('posint-public', 'election-declared', data)
  }

  async onStatsUpdated(stats: object) {
    await this.trigger('posint-public', 'stats-updated', stats)
  }

  // ─── Admin events ───────────────────────────────────────

  async onPipelineJobComplete(data: PipelineJobEvent) {
    await this.trigger('private-posint-admin', 'pipeline-job-complete', data)
  }

  async onPipelineJobFailed(data: PipelineJobEvent) {
    await this.trigger('private-posint-admin', 'pipeline-job-failed', data)
  }

  async onDataSourceError(data: { sourceId: string; sourceName: string; errorCount: number }) {
    await this.trigger('private-posint-admin', 'data-source-error', data)
  }

  // ─── Generic triggers ──────────────────────────────────

  async triggerPublic(event: string, data: object): Promise<void> {
    await this.trigger('posint-public', event, data)
  }

  async triggerAdmin(event: string, data: object): Promise<void> {
    await this.trigger('private-posint-admin', event, data)
  }

  // ─── Channel auth ───────────────────────────────────────

  authenticateChannel(socketId: string, channel: string, userId: string, role: string) {
    if (channel === 'private-posint-admin' && role !== 'ADMIN') {
      throw new ForbiddenException('Unauthorized for admin channel')
    }

    if (!this.pusher) throw new ForbiddenException('Pusher not configured')

    return this.pusher.authorizeChannel(socketId, channel, { user_id: userId })
  }

  // ─── Internal ───────────────────────────────────────────

  private async trigger(channel: string, event: string, data: object): Promise<void> {
    if (!this.pusher) return
    try {
      await this.pusher.trigger(channel, event, data)
    } catch (err) {
      this.logger.error(`Pusher trigger failed [${channel}/${event}]:`, err)
    }
  }
}
