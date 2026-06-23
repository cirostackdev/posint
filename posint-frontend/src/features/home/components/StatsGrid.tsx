"use client"

import { Users, Vote, FileText, AlertTriangle, Building, ArrowLeftRight } from "lucide-react"
import { Card } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { formatNaira, formatCompactNumber } from "@/shared/lib/utils"
import { usePlatformStats } from "../hooks/use-home"

export function StatsGrid() {
  const { data: statsData, isLoading } = usePlatformStats()

  const stats = [
    {
      label: "Politicians Tracked",
      value: statsData ? formatCompactNumber(statsData.politicians) : "0",
      icon: Users,
      change: "+23 this month",
      trend: "up" as const,
    },
    {
      label: "Elections Tracked",
      value: statsData ? formatCompactNumber(statsData.elections) : "0",
      icon: Vote,
      change: "Since 2007",
      trend: "up" as const,
    },
    {
      label: "Bills Monitored",
      value: statsData ? formatCompactNumber(statsData.bills) : "0",
      icon: FileText,
      change: "18 passed this session",
      trend: "up" as const,
    },
    {
      label: "Funds Recovered",
      value: statsData ? formatNaira(Number(statsData.totalRecoveredKobo)) : "₦0",
      icon: AlertTriangle,
      change: "EFCC + ICPC",
      trend: "warning" as const,
    },
    {
      label: "Constituency Projects",
      value: statsData ? formatCompactNumber(statsData.constituencyProjects) : "0",
      icon: Building,
      change: "₦4.2T allocated",
      trend: "up" as const,
    },
    {
      label: "Party Defections",
      value: statsData ? String(statsData.partyDefections) : "0",
      icon: ArrowLeftRight,
      change: "Since 2023 elections",
      trend: "neutral" as const,
    },
  ]

  if (isLoading) {
    return (
      <section className="py-12 md:py-16">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="p-4 border-border/50 bg-card">
                <Skeleton className="h-8 w-8 rounded-lg mb-3" />
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, index) => (
            <Card
              key={stat.label}
              className="relative overflow-hidden p-4 border-border/50 bg-card hover:shadow-lg transition-all duration-300 animate-scale-in group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />

              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${
                    stat.trend === "warning" ? "bg-status-warning/10" : "bg-primary/10"
                  }`}>
                    <stat.icon className={`h-4 w-4 ${
                      stat.trend === "warning" ? "text-status-warning" : "text-primary"
                    }`} />
                  </div>
                </div>

                <p className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {stat.label}
                </p>
                <p className={`text-[10px] font-medium ${
                  stat.trend === "up" ? "text-status-success" :
                  stat.trend === "warning" ? "text-status-warning" :
                  "text-muted-foreground"
                }`}>
                  {stat.change}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
