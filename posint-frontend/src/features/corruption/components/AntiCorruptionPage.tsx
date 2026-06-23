"use client"

import dynamic from "next/dynamic"
import { AlertTriangle } from "lucide-react"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Card, CardContent } from "@/shared/components/ui/card"
import { PageShell } from "@/shared/components/layout/PageShell"
import { SearchFilter } from "@/shared/components/shared/SearchFilter"
import { CaseCard } from "./CaseCard"
import { useCases, useCorruptionStats } from "../hooks/use-corruption"
import { useCorruptionStore } from "../store/useCorruptionStore"

const CorruptionChart = dynamic(
  () => import("./CorruptionChart").then((m) => ({ default: m.CorruptionChart })),
  { ssr: false, loading: () => <Skeleton className="h-[320px] w-full rounded-lg" /> }
)

const corruptionByYear = [
  { year: 2018, cases: 45, convictions: 8, amountRecovered: 2.5 },
  { year: 2019, cases: 52, convictions: 12, amountRecovered: 4.2 },
  { year: 2020, cases: 38, convictions: 6, amountRecovered: 1.8 },
  { year: 2021, cases: 61, convictions: 15, amountRecovered: 5.6 },
  { year: 2022, cases: 73, convictions: 18, amountRecovered: 8.3 },
  { year: 2023, cases: 87, convictions: 22, amountRecovered: 12.1 },
]

const YEARS = Array.from({ length: 8 }, (_, i) => String(2023 - i))

export function AntiCorruptionPage() {
  const { page, search, agency, status, year, setSearch, setFilter, clearFilters } = useCorruptionStore()
  const { data, isLoading } = useCases({ page, search, agency, status, year: year ?? undefined })
  const { data: stats } = useCorruptionStats()

  const activeFilters = { agency: agency ?? null, status: status ?? null, year: year ? String(year) : null }

  const totalRecovered = corruptionByYear.reduce((sum, d) => sum + d.amountRecovered, 0)
  const totalConvictions = corruptionByYear.reduce((sum, d) => sum + d.convictions, 0)
  const totalCases = corruptionByYear.reduce((sum, d) => sum + d.cases, 0)

  return (
    <PageShell
      hero={{
        icon: AlertTriangle,
        iconClassName: "bg-status-danger/10 text-status-danger",
        title: "Anti-Corruption Tracker",
        description: "Monitor EFCC and ICPC cases involving Nigerian politicians. Track investigations, convictions, and recovered assets.",
      }}
    >
      <div className="py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-display font-bold text-status-warning">
                {stats?.total ?? totalCases}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Cases</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-display font-bold text-status-danger">
                {stats?.convictions ?? totalConvictions}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Convictions</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-display font-bold text-status-success">
                ₦{totalRecovered.toFixed(1)}B
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Recovered</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-display font-bold text-status-info">
                {stats?.active ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Investigations</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <CorruptionChart />

        {/* Filters */}
        <SearchFilter
          searchTerm={search}
          onSearchChange={setSearch}
          placeholder="Search by politician name or description..."
          filters={[
            {
              label: "Agency",
              key: "agency",
              options: ["EFCC", "ICPC", "CCB", "NFIU"].map((a) => ({ value: a, label: a })),
            },
            {
              label: "Status",
              key: "status",
              options: ["UNDER_INVESTIGATION", "ONGOING", "CONVICTED", "ACQUITTED", "DISMISSED", "APPEALING"].map((s) => ({
                value: s,
                label: s.replace(/_/g, " "),
              })),
            },
            {
              label: "Year",
              key: "year",
              options: YEARS.map((y) => ({ value: y, label: y })),
            },
          ]}
          activeFilters={activeFilters}
          onFilterChange={setFilter}
          onClear={clearFilters}
          quickFilters={[
            { label: "EFCC", key: "agency", value: "EFCC" },
            { label: "ICPC", key: "agency", value: "ICPC" },
            { label: "Convicted", key: "status", value: "CONVICTED" },
            { label: "Under Investigation", key: "status", value: "UNDER_INVESTIGATION" },
          ]}
          resultCount={data?.data?.length ?? 0}
          totalCount={data?.meta?.total ?? 0}
        />

        {/* Cases Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-52" />
            ))}
          </div>
        ) : !data?.data?.length ? (
          <div className="text-center py-16">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No cases found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {data.data.map((case_, index) => (
              <CaseCard
                key={case_.id}
                case_={case_}
                style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
