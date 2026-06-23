"use client"

import Link from "next/link"
import { FileText, Clock, CheckCircle2, XCircle, ChevronRight } from "lucide-react"
import { Card } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { useBills } from "@/features/legislature/hooks/use-legislature"

const statusConfig: Record<string, { variant: "info" | "warning" | "success" | "danger"; icon: React.ElementType }> = {
  "First Reading": { variant: "info", icon: Clock },
  "Second Reading": { variant: "warning", icon: Clock },
  "Third Reading": { variant: "warning", icon: Clock },
  "Passed": { variant: "success", icon: CheckCircle2 },
  "Rejected": { variant: "danger", icon: XCircle },
}

export function RecentLegislation() {
  const { data, isLoading } = useBills({ page: 1 })

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-16 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Legislative Activity
            </h2>
            <p className="text-muted-foreground">
              Track bills and legislation through the National Assembly
            </p>
          </div>
          <Button variant="outline" className="self-start md:self-auto" asChild>
            <Link href="/legislature">
              View All Bills
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {(data?.data ?? []).slice(0, 4).map((activity, index) => {
            const status = statusConfig[activity.status] ?? { variant: "info" as const, icon: Clock }
            const StatusIcon = status.icon

            return (
              <Link key={activity.id} href={`/legislature/${activity.id}`}>
                <Card
                  className="p-4 md:p-5 border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 hidden md:flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {activity.title}
                        </h3>
                        <Badge variant={status.variant} className="self-start sm:self-auto">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {activity.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sponsored by{" "}
                        <span className="font-medium text-foreground">
                          {activity.politician?.name ?? "Unknown"}
                        </span>
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-normal">
                          {activity.chamber}
                        </Badge>
                      </div>
                      <span className="hidden sm:inline">{activity.dateIntroduced}</span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
