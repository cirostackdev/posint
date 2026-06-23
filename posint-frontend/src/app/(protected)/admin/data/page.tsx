"use client"

import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/shared/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Skeleton } from "@/shared/components/ui/skeleton"

interface DataSource {
  id: string
  name: string
  url: string
  lastFetchedAt: string | null
  status: string
  recordsCount: number | null
}

function statusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "success" as const
    case "error":
      return "danger" as const
    case "pending":
      return "warning" as const
    default:
      return "secondary" as const
  }
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never"
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function DataPage() {
  const { data: sources, isLoading } = useQuery({
    queryKey: ["admin-data-sources"],
    queryFn: () => apiGet<DataSource[]>("/admin/data-sources"),
    staleTime: 1000 * 60 * 2,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Data Sources</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Read-only view of all registered data sources
        </p>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Sources
            {sources && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({sources.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">URL</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Fetched</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Records</th>
                  </tr>
                </thead>
                <tbody>
                  {(sources ?? []).map((source) => (
                    <tr
                      key={source.id}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {source.name}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline truncate block"
                        >
                          {source.url}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadgeVariant(source.status)} className="capitalize">
                          {source.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {relativeTime(source.lastFetchedAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {source.recordsCount !== null
                          ? source.recordsCount.toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                  {(sources ?? []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No data sources found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
