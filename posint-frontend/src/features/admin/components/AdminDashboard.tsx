"use client"

import Link from "next/link"
import {
  Users,
  Vote,
  FileText,
  AlertTriangle,
  BookOpen,
  Building2,
  GitBranch,
  Database,
  ClipboardList,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { useAdminStats } from "../hooks/use-admin"

interface StatCardProps {
  label: string
  value: number | string | null | undefined
  isLoading: boolean
}

function StatCard({ label, value, isLoading }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      {isLoading ? (
        <Skeleton className="mt-2 h-7 w-20" />
      ) : (
        <p className="mt-1 text-2xl font-bold text-foreground">
          {typeof value === "number" ? value.toLocaleString() : (value ?? "—")}
        </p>
      )}
    </div>
  )
}

interface QuickActionProps {
  href: string
  icon: React.ElementType
  title: string
  description: string
}

function QuickAction({ href, icon: Icon, title, description }: QuickActionProps) {
  return (
    <Link href={href} className="group block">
      <Card className="h-full border-border/50 bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-md">
        <CardContent className="flex items-start gap-4 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground leading-tight">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground leading-snug">{description}</p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary" />
        </CardContent>
      </Card>
    </Link>
  )
}

const QUICK_ACTIONS: QuickActionProps[] = [
  {
    href: "/admin/politicians",
    icon: Users,
    title: "Manage Politicians",
    description: "Add, edit, and review politician profiles.",
  },
  {
    href: "/admin/elections",
    icon: Vote,
    title: "Manage Elections",
    description: "Configure elections and sync result data.",
  },
  {
    href: "/admin/legislature",
    icon: BookOpen,
    title: "Manage Legislature",
    description: "Track bills, votes, and legislative records.",
  },
  {
    href: "/admin/corruption",
    icon: AlertTriangle,
    title: "Manage Corruption Cases",
    description: "Review and update EFCC/ICPC case records.",
  },
  {
    href: "/admin/parties",
    icon: Building2,
    title: "Manage Parties",
    description: "Edit political party profiles and metadata.",
  },
  {
    href: "/admin/users",
    icon: Users,
    title: "Manage Users",
    description: "View all accounts and manage user roles.",
  },
  {
    href: "/admin/pipeline",
    icon: GitBranch,
    title: "Pipeline Status",
    description: "Trigger and monitor data ingestion jobs.",
  },
  {
    href: "/admin/data",
    icon: Database,
    title: "Data Sources",
    description: "Inspect external data source connection status.",
  },
  {
    href: "/admin/audit",
    icon: ClipboardList,
    title: "Audit Log",
    description: "Track all admin actions and record changes.",
  },
]

export function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats()

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
        <p className="mt-1 text-muted-foreground">
          Platform overview and quick access to all admin sections.
        </p>
      </div>

      {/* Stats row */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Platform Stats
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Politicians" value={stats?.totalPoliticians} isLoading={isLoading} />
          <StatCard label="Elections" value={stats?.totalElections} isLoading={isLoading} />
          <StatCard label="Bills" value={stats?.totalBills} isLoading={isLoading} />
          <StatCard label="Cases" value={stats?.totalCases} isLoading={isLoading} />
          <StatCard label="Active Jobs" value={stats?.activePipelineJobs} isLoading={isLoading} />
          <StatCard
            label="Last Sync"
            value={
              stats?.lastSyncAt
                ? new Date(stats.lastSyncAt).toLocaleDateString()
                : "Never"
            }
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <QuickAction key={action.href} {...action} />
          ))}
        </div>
      </section>
    </div>
  )
}
