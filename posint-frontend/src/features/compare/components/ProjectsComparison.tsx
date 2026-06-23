"use client"

import { MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import { Skeleton } from "@/shared/components/ui/skeleton"
import type { Politician, ConstituencyProject } from "@/features/politicians/api/politicians.types"
import { usePoliticianProjects } from "@/features/politicians/hooks/use-politicians"

interface ProjectsComparisonProps {
  politicians: Politician[]
}

const statusColors: Record<string, string> = {
  Completed: "bg-status-success/20 text-status-success",
  COMPLETED: "bg-status-success/20 text-status-success",
  Ongoing: "bg-status-warning/20 text-status-warning",
  ONGOING: "bg-status-warning/20 text-status-warning",
  "Not Started": "bg-muted text-muted-foreground",
  NOT_STARTED: "bg-muted text-muted-foreground",
  Abandoned: "bg-status-danger/20 text-status-danger",
  ABANDONED: "bg-status-danger/20 text-status-danger",
}

function formatBudget(kobo: string | number): string {
  const n = typeof kobo === "string" ? parseFloat(kobo) : kobo
  if (isNaN(n)) return "—"
  const naira = n / 100
  if (naira >= 1_000_000_000) return `₦${(naira / 1_000_000_000).toFixed(1)}B`
  if (naira >= 1_000_000) return `₦${(naira / 1_000_000).toFixed(1)}M`
  return `₦${naira.toLocaleString()}`
}

function isOngoing(status: string) {
  return status === "Ongoing" || status === "ONGOING"
}

function ProjectsStats({ politician }: { politician: Politician }) {
  const { data: projects, isLoading } = usePoliticianProjects(politician.slug)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  const list = (projects ?? []) as ConstituencyProject[]
  const completed = list.filter((p) => p.status === "Completed" || p.status === "COMPLETED").length
  const ongoing = list.filter((p) => p.status === "Ongoing" || p.status === "ONGOING").length
  const abandoned = list.filter((p) => p.status === "Abandoned" || p.status === "ABANDONED").length

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-medium text-foreground truncate mb-2">{politician.name}</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-status-success">{completed}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Done</p>
          </div>
          <div>
            <p className="text-lg font-bold text-status-warning">{ongoing}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Ongoing</p>
          </div>
          <div>
            <p className="text-lg font-bold text-status-danger">{abandoned}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Dropped</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProjectsList({ politician }: { politician: Politician }) {
  const { data: projects, isLoading } = usePoliticianProjects(politician.slug)

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{politician.name.split(" ").pop()}&apos;s Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  const list = (projects ?? []) as ConstituencyProject[]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{politician.name.split(" ").pop()}&apos;s Projects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {list.length > 0 ? (
          list.map((project) => (
            <div key={project.id} className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-sm font-medium text-foreground leading-tight mb-1">{project.title}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                <MapPin className="h-3 w-3" />
                {project.location}
              </p>
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className={statusColors[project.status] ?? ""}>
                  {project.status.replace(/_/g, " ")}
                </Badge>
                <span className="text-xs font-semibold text-foreground">
                  {formatBudget(project.budgetKobo)}
                </span>
              </div>
              {isOngoing(project.status) && (
                <Progress value={project.completionPct ?? 45} className="h-1.5 mt-2" />
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No projects</p>
        )}
      </CardContent>
    </Card>
  )
}

export function ProjectsComparison({ politicians }: ProjectsComparisonProps) {
  const gridCols =
    politicians.length === 2
      ? "md:grid-cols-2"
      : politicians.length === 3
      ? "md:grid-cols-3"
      : "md:grid-cols-2 lg:grid-cols-4"

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {politicians.map((pol) => (
          <ProjectsStats key={pol.id} politician={pol} />
        ))}
      </div>

      {/* Project lists side by side */}
      <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
        {politicians.map((pol) => (
          <ProjectsList key={pol.id} politician={pol} />
        ))}
      </div>
    </div>
  )
}
