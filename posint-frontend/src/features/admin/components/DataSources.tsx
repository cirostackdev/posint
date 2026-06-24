"use client"

import { CheckCircle2, XCircle, MinusCircle, HelpCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Button } from "@/shared/components/ui/button"
import { useDataSources } from "../hooks/use-admin"
import type { DataSourceStatus } from "../api/admin.types"

function statusIcon(status: DataSourceStatus) {
  switch (status) {
    case "active":
      return <CheckCircle2 className="h-4 w-4 text-green-400" />
    case "inactive":
      return <MinusCircle className="h-4 w-4 text-yellow-400" />
    case "error":
      return <XCircle className="h-4 w-4 text-red-400" />
    default:
      return <HelpCircle className="h-4 w-4 text-muted-foreground" />
  }
}

function statusBadgeVariant(status: DataSourceStatus): "success" | "warning" | "danger" | "secondary" {
  switch (status) {
    case "active":
      return "success"
    case "inactive":
      return "warning"
    case "error":
      return "danger"
    default:
      return "secondary"
  }
}

export function DataSources() {
  const { data: sources, isLoading, refetch, isFetching } = useDataSources()

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Data Sources</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
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
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Source
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Type
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Last Success
                    </th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Errors
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(!sources || sources.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No data sources found.
                      </td>
                    </tr>
                  ) : (
                    sources.map((source) => (
                      <tr
                        key={source.id}
                        className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{source.name}</p>
                            {source.url && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {source.url}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground capitalize">
                          {source.type}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {statusIcon(source.status)}
                            <Badge variant={statusBadgeVariant(source.status)} className="capitalize text-xs">
                              {source.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {source.lastSuccessAt
                            ? new Date(source.lastSuccessAt).toLocaleString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs max-w-[200px]">
                          {source.errorCount > 0 ? (
                            <span className="text-red-400">{source.errorCount} errors</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))
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
