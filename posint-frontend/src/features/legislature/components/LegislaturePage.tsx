"use client"

import dynamic from "next/dynamic"
import { FileText } from "lucide-react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { PageShell } from "@/shared/components/layout/PageShell"
import { SearchFilter } from "@/shared/components/shared/SearchFilter"
import { EmptyState } from "@/shared/components/shared/EmptyState"
import { BillCard } from "./BillCard"
import { useBills, useLegislatureStats } from "../hooks/use-legislature"
import { useLegislatureStore } from "../store/useLegislatureStore"

const LegislativeChart = dynamic(
  () => import("./LegislativeChart").then((m) => ({ default: m.LegislativeChart })),
  { ssr: false, loading: () => <Skeleton className="h-[320px] w-full rounded-lg" /> }
)

export function LegislaturePage() {
  const { page, search, status, chamber, setPage, setSearch, setFilter, clearFilters } = useLegislatureStore()
  const { data, isLoading } = useBills({ page, search, status, chamber })
  const { data: stats } = useLegislatureStats()

  const activeFilters = { status: status ?? null, chamber: chamber ?? null }

  return (
    <PageShell
      hero={{
        icon: FileText,
        iconClassName: "bg-primary/10 text-primary",
        title: "Legislative Activity",
        description: "Track bills and legislation through the National Assembly. Monitor progress from first reading to passage or rejection.",
      }}
    >
      <section className="py-8">
        <div className="container px-4">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-display font-bold text-foreground">{stats?.total ?? "—"}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Bills Introduced</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-display font-bold text-status-success">{stats?.passed ?? "—"}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Bills Passed</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-display font-bold text-status-danger">{stats?.rejected ?? "—"}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Bills Rejected</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-display font-bold text-status-warning">{stats?.pending ?? "—"}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">In Progress</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <div className="mb-8">
            <LegislativeChart />
          </div>

          {/* Filters */}
          <SearchFilter
            searchTerm={search}
            onSearchChange={setSearch}
            placeholder="Search bills by title or sponsor..."
            filters={[
              {
                label: "Status",
                key: "status",
                options: ["FIRST_READING", "SECOND_READING", "THIRD_READING", "PASSED", "REJECTED", "WITHDRAWN"].map((s) => ({
                  value: s,
                  label: s.replace(/_/g, " "),
                })),
              },
              {
                label: "Chamber",
                key: "chamber",
                options: [
                  { value: "SENATE", label: "Senate" },
                  { value: "HOUSE_OF_REPRESENTATIVES", label: "House of Reps" },
                ],
              },
            ]}
            activeFilters={activeFilters}
            onFilterChange={setFilter}
            onClear={clearFilters}
            quickFilters={[
              { label: "Passed", key: "status", value: "PASSED" },
              { label: "In Progress", key: "status", value: "SECOND_READING" },
              { label: "Senate", key: "chamber", value: "SENATE" },
              { label: "House", key: "chamber", value: "HOUSE_OF_REPRESENTATIVES" },
            ]}
            resultCount={data?.data?.length ?? 0}
            totalCount={data?.meta?.total ?? 0}
          />

          {/* Bills List */}
          {isLoading ? (
            <div className="mt-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : !data?.data?.length ? (
            <div className="mt-6">
              <EmptyState icon={FileText} title="No bills found" description="Try adjusting your search or filters." />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {data.data.map((bill, index) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  style={{ animationDelay: `${index * 0.05}s` }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  )
}
