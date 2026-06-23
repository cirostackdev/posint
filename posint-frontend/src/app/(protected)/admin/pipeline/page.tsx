"use client"

import { PlayCircle, Loader2, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Badge } from "@/shared/components/ui/badge"
import { usePipelineJobs, useTriggerPipeline } from "@/features/admin/hooks/use-admin"
import type { PipelineTrigger } from "@/features/admin/hooks/use-admin"

const TRIGGERS: { key: PipelineTrigger; label: string; description: string }[] = [
  { key: "nass", label: "NASS Scrape", description: "Scrape National Assembly bills and votes" },
  { key: "efcc", label: "EFCC Cases", description: "Fetch latest EFCC corruption cases" },
  { key: "inec", label: "INEC Results", description: "Sync INEC election result data" },
  { key: "social", label: "Social Fetch", description: "Fetch social media posts for politicians" },
  { key: "sentiment", label: "Sentiment Compute", description: "Recompute sentiment scores" },
  { key: "stats", label: "Stats Recompute", description: "Rebuild platform-wide statistics" },
]

function statusIcon(status: string) {
  switch (status) {
    case "running":
      return <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-400" />
    case "failed":
      return <XCircle className="h-4 w-4 text-red-400" />
    default:
      return <Clock className="h-4 w-4 text-yellow-400" />
  }
}

function statusBadgeVariant(status: string): "info" | "success" | "danger" | "warning" | "secondary" {
  switch (status) {
    case "running":   return "info"
    case "completed": return "success"
    case "failed":    return "danger"
    case "pending":   return "warning"
    default:          return "secondary"
  }
}

function cardBg(status: string) {
  switch (status) {
    case "running":   return "border-blue-500/30 bg-blue-500/5"
    case "completed": return "border-green-500/30 bg-green-500/5"
    case "failed":    return "border-red-500/30 bg-red-500/5"
    default:          return "border-border/50 bg-card"
  }
}

export default function PipelinePage() {
  const { data: jobs, isLoading: jobsLoading } = usePipelineJobs()
  const { mutate: trigger, isPending, variables: pendingTrigger } = useTriggerPipeline()

  const jobMap = new Map(jobs?.map((j) => [j.name.toLowerCase(), j]) ?? [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Trigger and monitor data pipeline jobs
        </p>
      </div>

      {/* Trigger cards */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Pipeline Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TRIGGERS.map(({ key, label, description }) => {
              const job = jobMap.get(key)
              const isRunning = isPending && pendingTrigger === key

              return (
                <div
                  key={key}
                  className={`rounded-lg border p-4 flex flex-col gap-3 transition-colors ${
                    job ? cardBg(job.status) : "border-border/50 bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                    </div>
                    {job && statusIcon(job.status)}
                  </div>

                  {job && (
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {job.startedAt && (
                        <p>Started: {new Date(job.startedAt).toLocaleString()}</p>
                      )}
                      {job.completedAt && (
                        <p>Finished: {new Date(job.completedAt).toLocaleString()}</p>
                      )}
                      {job.error && (
                        <p className="text-red-400 truncate">{job.error}</p>
                      )}
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-auto w-full"
                    onClick={() => trigger(key)}
                    disabled={isPending || job?.status === "running"}
                  >
                    {isRunning ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Triggering…
                      </>
                    ) : (
                      <>
                        <PlayCircle className="mr-1 h-3 w-3" />
                        Trigger
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Jobs history table */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {jobsLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !jobs || jobs.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No jobs found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Job</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Started</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Finished</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {job.name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {statusIcon(job.status)}
                          <Badge variant={statusBadgeVariant(job.status)} className="capitalize">
                            {job.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {job.startedAt ? new Date(job.startedAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {job.completedAt ? new Date(job.completedAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-red-400 max-w-xs">
                        {job.error ? (
                          <span className="truncate block" title={job.error}>
                            {job.error}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
