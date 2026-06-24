import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'
import { createHash } from 'crypto'

export interface SearchResult {
  entityType: string
  entityId: string
  slug?: string | null
  title: string
  subtitle: string
  relevance: number
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  async globalSearch(query: string, limit = 10): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return []

    const term = query.trim()
    const hash = createHash('sha256').update(`${term}:${limit}`).digest('hex').slice(0, 16)

    return this.redis.getOrSet(`search:${hash}`, async () => {
      // Use PostgreSQL full-text search with websearch_to_tsquery for ranked results
      const results = await this.prisma.$queryRaw<SearchResult[]>`
        (
          SELECT 'politician' AS "entityType", id::text AS "entityId", slug,
                 name AS title,
                 position || ' — ' || state AS subtitle,
                 ts_rank(fts, websearch_to_tsquery('english', ${term}))::float AS relevance
          FROM politicians
          WHERE fts @@ websearch_to_tsquery('english', ${term}) AND is_active = true
          ORDER BY relevance DESC
          LIMIT ${limit}
        )
        UNION ALL
        (
          SELECT 'bill' AS "entityType", sb.id::text AS "entityId", NULL AS slug,
                 sb.title,
                 sb.status || ' — ' || sb.chamber AS subtitle,
                 ts_rank(sb.fts, websearch_to_tsquery('english', ${term}))::float AS relevance
          FROM sponsored_bills sb
          WHERE sb.fts @@ websearch_to_tsquery('english', ${term})
          ORDER BY relevance DESC
          LIMIT ${Math.floor(limit / 2)}
        )
        UNION ALL
        (
          SELECT 'case' AS "entityType", cc.id::text AS "entityId", NULL AS slug,
                 cc.politician_name AS title,
                 cc.agency || ' — ' || cc.status AS subtitle,
                 ts_rank(cc.fts, websearch_to_tsquery('english', ${term}))::float AS relevance
          FROM corruption_cases cc
          WHERE cc.fts @@ websearch_to_tsquery('english', ${term}) AND cc.is_active = true
          ORDER BY relevance DESC
          LIMIT ${Math.floor(limit / 2)}
        )
        UNION ALL
        (
          SELECT 'election' AS "entityType", e.id::text AS "entityId", NULL AS slug,
                 e.type || ' (' || e.year || ')' AS title,
                 e.winner_name || COALESCE(' — ' || e.state, ' — Federal') AS subtitle,
                 ts_rank(e.fts, websearch_to_tsquery('english', ${term}))::float AS relevance
          FROM elections e
          WHERE e.fts @@ websearch_to_tsquery('english', ${term})
          ORDER BY relevance DESC
          LIMIT ${Math.floor(limit / 2)}
        )
        ORDER BY relevance DESC
        LIMIT ${limit}
      `

      // Fallback: if FTS returns fewer than 3 results (e.g. FTS columns not yet indexed),
      // supplement with ILIKE on politicians
      if (results.length < 3) {
        const fallback = await this.prisma.politician.findMany({
          where: {
            isActive: true,
            OR: [
              { name: { contains: term, mode: 'insensitive' } },
              { state: { contains: term, mode: 'insensitive' } },
            ],
          },
          select: { id: true, slug: true, name: true, position: true, state: true },
          take: limit - results.length,
        })

        const fallbackResults: SearchResult[] = fallback.map(p => ({
          entityType: 'politician',
          entityId: p.id,
          slug: p.slug,
          title: p.name,
          subtitle: `${p.position} — ${p.state}`,
          relevance: 0.1,
        }))

        return [...results, ...fallbackResults]
      }

      return results
    }, 120)
  }
}
