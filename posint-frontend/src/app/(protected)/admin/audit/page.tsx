"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { useAuditLog } from "@/features/admin/hooks/use-admin"

function actionBadgeVariant(action: string): "success" | "info" | "danger" | "secondary" {
  switch (action.toUpperCase()) {
    case "INSERT":
      return "success"
    case "UPDATE":
      return "info"
    case "DELETE":
      return "danger"
    default:
      return "secondary"
  }
}

function relativeTime(dateStr: string): string {
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

export default function AuditLogPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAuditLog(page)

  const entries = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Record of all data mutations across the platform
        </p>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Events
            {data && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({data.total.toLocaleString()} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    {["Time", "Action", "Table", "Record ID", "Changed By"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-sm text-muted-foreground"
                      >
                        No audit log entries found.
                      </td>
                    </tr>
                  ) : (
                    entries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {relativeTime(entry.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={actionBadgeVariant(entry.action)} className="text-xs uppercase">
                            {entry.action}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground font-mono">
                          {entry.resource}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                          {entry.resourceId ? (
                            <span title={entry.resourceId}>
                              {entry.resourceId.slice(0, 12)}…
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {entry.userEmail ?? entry.userId ?? "system"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
