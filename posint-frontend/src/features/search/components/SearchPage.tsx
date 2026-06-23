"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Users, FileText, Shield, Vote, Loader2 } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import { Card, CardContent } from "@/shared/components/ui/card"
import { EmptyState } from "@/shared/components/shared/EmptyState"
import { useGlobalSearch } from "../hooks/use-search"
import { useDebouncedValue } from "../hooks/use-debounced-value"
import type { SearchResult } from "../hooks/use-search"
import { cn } from "@/shared/lib/utils"

const ENTITY_CONFIG: Record<string, { icon: typeof Users; href: (r: SearchResult) => string; color: string }> = {
  politician: { icon: Users, href: (r) => `/politicians/${r.slug ?? r.entityId}`, color: "text-primary" },
  bill: { icon: FileText, href: (r) => `/legislature/${r.entityId}`, color: "text-status-info" },
  case: { icon: Shield, href: (r) => `/anti-corruption/${r.entityId}`, color: "text-status-danger" },
  election: { icon: Vote, href: (r) => `/elections/${r.entityId}`, color: "text-status-warning" },
}

export function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get("q") ?? "")
  const debouncedQuery = useDebouncedValue(query, 300)

  const { data: results = [], isLoading } = useGlobalSearch(debouncedQuery)

  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    router.replace(`/search?${params.toString()}`, { scroll: false })
  }, [query, router])

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.entityType]) acc[r.entityType] = []
    acc[r.entityType].push(r)
    return acc
  }, {})

  return (
    <div className="container px-4 py-8 max-w-3xl mx-auto">
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search politicians, bills, cases, elections..."
          className="pl-12 h-14 text-lg"
          autoFocus
        />
        {isLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
      </div>

      {debouncedQuery.length < 2 ? (
        <EmptyState icon={Search} title="Start searching" description="Type at least 2 characters to search across politicians, bills, cases, and elections." />
      ) : isLoading ? null : results.length === 0 ? (
        <EmptyState icon={Search} title="No results found" description={`No results found for "${debouncedQuery}". Try different keywords.`} />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([type, items]) => {
            const config = ENTITY_CONFIG[type]
            if (!config) return null
            const { icon: Icon, href, color } = config
            return (
              <section key={type}>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", color)} />
                  {type.charAt(0).toUpperCase() + type.slice(1)}s
                </h2>
                <div className="space-y-2">
                  {items.map((result) => (
                    <Link key={result.entityId} href={href(result)}>
                      <Card className="border-border/50 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
                        <CardContent className="p-4 flex items-center gap-3">
                          <Icon className={cn("h-5 w-5 flex-shrink-0", color)} />
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">{result.title}</p>
                            <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
