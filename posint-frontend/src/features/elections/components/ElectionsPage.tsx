"use client"

import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { Vote } from "lucide-react"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Card, CardContent } from "@/shared/components/ui/card"
import { PageShell } from "@/shared/components/layout/PageShell"
import { SearchFilter } from "@/shared/components/shared/SearchFilter"
import { EmptyState } from "@/shared/components/shared/EmptyState"
import { NIGERIAN_STATES } from "@/shared/lib/constants"
import { ElectionCard } from "./ElectionCard"
import { useElections, useElectionsStats } from "../hooks/use-elections"
import { useElectionsStore } from "../store/useElectionsStore"

const ElectionResultsChart = dynamic(
  () => import("./ElectionResultsChart").then((m) => ({ default: m.ElectionResultsChart })),
  { ssr: false, loading: () => <Skeleton className="h-[400px] w-full rounded-lg" /> }
)

const YEARS = Array.from({ length: 5 }, (_, i) => 2023 - i * 4).map(String)

export function ElectionsPage() {
  const {
    page,
    search,
    level,
    year,
    state,
    party,
    setSearch,
    setFilter,
    clearFilters,
  } = useElectionsStore()

  const { data, isLoading } = useElections({
    page,
    search,
    level,
    year: year ?? undefined,
    state,
    party,
  })
  const { data: stats } = useElectionsStats()

  // Stats derived from current result set
  const elections = data?.data ?? []

  const uniqueYears = useMemo(() => new Set(elections.map((e) => e.year)), [elections])
  const uniqueParties = useMemo(() => new Set(elections.map((e) => e.winnerParty?.abbreviation ?? e.winnerPartyId ?? "")), [elections])
  const topParty = useMemo(() => {
    const counts: Record<string, number> = {}
    elections.forEach((e) => {
      const p = e.winnerParty?.abbreviation ?? e.winnerPartyId ?? "OTHER"
      counts[p] = (counts[p] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A"
  }, [elections])

  // Available LGAs for selected state (client-side from loaded data)
  const availableLGAs = useMemo(() => {
    if (!state) return []
    return [...new Set(elections.filter((e) => e.lga).map((e) => e.lga!))].sort()
  }, [elections, state])

  const activeFilters = {
    level: level ?? null,
    year: year ? String(year) : null,
    state: state ?? null,
    party: party ?? null,
  }

  const filterConfigs = [
    {
      label: "Level",
      key: "level",
      options: ["FEDERAL", "STATE", "LOCAL_GOVERNMENT", "PARTY_PRIMARY"].map((l) => ({
        value: l,
        label: l.replace(/_/g, " "),
      })),
    },
    {
      label: "Year",
      key: "year",
      options: YEARS.map((y) => ({ value: y, label: y })),
    },
    ...(level !== "FEDERAL"
      ? [{ label: "State", key: "state", options: NIGERIAN_STATES.map((s) => ({ value: s, label: s })) }]
      : []),
    ...(availableLGAs.length > 0
      ? [{ label: "LGA", key: "lga", options: availableLGAs.map((l) => ({ value: l, label: l })) }]
      : []),
    {
      label: "Party",
      key: "party",
      options: ["APC", "PDP", "LP", "NNPP", "APGA"].map((p) => ({ value: p, label: p })),
    },
  ]

  const chartTitle = useMemo(() => {
    if (level) {
      const levelLabel = level.replace(/_/g, " ")
      return `${levelLabel} Elections${state ? ` — ${state}` : ""}${year ? ` (${year})` : ""}`
    }
    return "All Election Results"
  }, [level, state, year])

  return (
    <PageShell
      hero={{
        icon: Vote,
        iconClassName: "bg-accent/20 text-accent-foreground",
        title: "Election Results",
        description:
          "Comprehensive database of Nigerian elections — federal, state governorship, local government, and party primaries from 2007 to present.",
      }}
    >
      <div className="py-8 space-y-6">
        {/* Reactive Chart */}
        <ElectionResultsChart data={elections} title={chartTitle} />

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-display font-bold text-foreground">{elections.length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Elections Shown</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-display font-bold text-foreground">{uniqueYears.size}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Election Years</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-display font-bold text-foreground">{uniqueParties.size}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Winning Parties</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-display font-bold text-status-info">{topParty}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Most Wins</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <SearchFilter
          searchTerm={search}
          onSearchChange={setSearch}
          placeholder="Search by winner, election type, state, LGA..."
          filters={filterConfigs}
          activeFilters={activeFilters}
          onFilterChange={setFilter}
          onClear={clearFilters}
          quickFilters={[
            { label: "🏛️ Federal", key: "level", value: "FEDERAL" },
            { label: "🏢 State", key: "level", value: "STATE" },
            { label: "🏘️ LGA", key: "level", value: "LOCAL_GOVERNMENT" },
            { label: "🗳️ Primaries", key: "level", value: "PARTY_PRIMARY" },
            { label: "2023", key: "year", value: "2023" },
            { label: "2019", key: "year", value: "2019" },
          ]}
          resultCount={elections.length}
          totalCount={data?.meta?.total ?? 0}
        />

        {/* Results List */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : elections.length === 0 ? (
          <EmptyState icon={Vote} title="No elections found" description="Try adjusting your filters." />
        ) : (
          <div className="space-y-3">
            {elections.map((election, index) => (
              <ElectionCard
                key={election.id}
                election={election}
                style={{ animationDelay: `${Math.min(index, 20) * 0.03}s` }}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
