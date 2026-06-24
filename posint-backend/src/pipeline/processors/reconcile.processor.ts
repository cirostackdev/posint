import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Logger } from '@nestjs/common'
import { Job } from 'bullmq'
import { PrismaService } from '../../prisma/prisma.service'
import { QUEUE_NAMES } from '../pipeline.constants'

@Processor(QUEUE_NAMES.RECONCILE_COUNTERS, { concurrency: 1 })
export class ReconcileProcessor extends WorkerHost {
  private readonly logger = new Logger(ReconcileProcessor.name)

  constructor(private prisma: PrismaService) {
    super()
  }

  async process(job: Job) {
    this.logger.log('Reconciling denormalized counters...')

    // Reconcile bills_sponsored
    const billCounts = await this.prisma.$queryRaw<Array<{ id: string; count: bigint }>>`
      SELECT p.id, COUNT(sb.id)::bigint AS count
      FROM politicians p
      LEFT JOIN sponsored_bills sb ON sb.politician_id = p.id
      WHERE p.is_active = true
      GROUP BY p.id
    `

    let updated = 0
    for (const row of billCounts) {
      const count = Number(row.count)
      await this.prisma.politician.updateMany({
        where: { id: row.id, billsSponsored: { not: count } },
        data: { billsSponsored: count },
      })
      updated++
    }

    // Reconcile attendance_rate
    const attendanceRates = await this.prisma.$queryRaw<Array<{ id: string; rate: number }>>`
      SELECT p.id,
        COALESCE(
          ROUND(
            (COUNT(vr.id) FILTER (WHERE vr.vote != 'ABSENT')::numeric / NULLIF(COUNT(vr.id), 0)) * 100,
            2
          ),
          0
        )::float AS rate
      FROM politicians p
      LEFT JOIN voting_records vr ON vr.politician_id = p.id
      WHERE p.is_active = true
      GROUP BY p.id
    `

    for (const row of attendanceRates) {
      await this.prisma.politician.updateMany({
        where: { id: row.id },
        data: { attendanceRate: row.rate },
      })
    }

    this.logger.log(`Reconciled counters for ${updated} politicians`)
    return { reconciled: updated }
  }
}
