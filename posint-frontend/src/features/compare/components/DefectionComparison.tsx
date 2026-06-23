"use client"

import { ArrowRight, Repeat } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { PartyBadge } from "@/shared/components/shared/PartyBadge"
import type { Politician, PartyDefection } from "@/features/politicians/api/politicians.types"
import { usePoliticianDefections } from "@/features/politicians/hooks/use-politicians"

interface DefectionComparisonProps {
  politicians: Politician[]
}

const partyColors: Record<string, string> = {
  APC: "hsl(210, 80%, 55%)",
  PDP: "hsl(0, 72%, 51%)",
  LP: "hsl(142, 70%, 45%)",
  NNPP: "hsl(38, 92%, 50%)",
  APGA: "hsl(280, 60%, 50%)",
  SDP: "hsl(320, 60%, 50%)",
  ACN: "hsl(45, 80%, 50%)",
  AC: "hsl(200, 50%, 50%)",
  ANPP: "hsl(180, 60%, 45%)",
}

function DefectionsChartInner({ politicians }: { politicians: Politician[] }) {
  const p0 = usePoliticianDefections(politicians[0]?.slug ?? "")
  const p1 = usePoliticianDefections(politicians[1]?.slug ?? "")
  const p2 = usePoliticianDefections(politicians[2]?.slug ?? "")
  const p3 = usePoliticianDefections(politicians[3]?.slug ?? "")

  const defectionQueries = [
    { politician: politicians[0], defections: (p0.data ?? []) as PartyDefection[], isLoading: p0.isLoading },
    { politician: politicians[1], defections: (p1.data ?? []) as PartyDefection[], isLoading: p1.isLoading },
    { politician: politicians[2], defections: (p2.data ?? []) as PartyDefection[], isLoading: p2.isLoading },
    { politician: politicians[3], defections: (p3.data ?? []) as PartyDefection[], isLoading: p3.isLoading },
  ].filter((q) => q.politician)

  const isLoading = defectionQueries.some((q) => q.isLoading)

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  const chartData = defectionQueries.map((q) => ({
    name: q.politician!.name.split(" ").pop() ?? q.politician!.name,
    defections: q.defections.length,
    party: q.politician!.party,
  }))

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ left: 0, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              color: "hsl(var(--foreground))",
            }}
          />
          <Bar dataKey="defections" name="Defections" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={partyColors[entry.party] ?? "hsl(var(--primary))"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function DefectionsChart({ politicians }: { politicians: Politician[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Defection Count Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DefectionsChartInner politicians={politicians} />
      </CardContent>
    </Card>
  )
}

function DefectionHistory({ politician }: { politician: Politician }) {
  const { data: defections, isLoading } = usePoliticianDefections(politician.slug)

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {politician.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  const sorted = [...((defections ?? []) as PartyDefection[])].sort((a, b) => {
    const yearA = a.defectionDate ? new Date(a.defectionDate).getFullYear() : 0
    const yearB = b.defectionDate ? new Date(b.defectionDate).getFullYear() : 0
    return yearA - yearB
  })

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {politician.name}
          <PartyBadge party={politician.party} size="sm" />
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {sorted.length} defection{sorted.length !== 1 ? "s" : ""}
        </p>
      </CardHeader>
      <CardContent>
        {sorted.length > 0 ? (
          <div className="space-y-3">
            {sorted.map((d) => {
              const fromParty = d.fromParty?.abbreviation ?? "?"
              const toParty = d.toParty?.abbreviation ?? "?"
              const year = d.defectionDate
                ? new Date(d.defectionDate).getFullYear()
                : "—"
              return (
                <div
                  key={d.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50"
                >
                  <PartyBadge party={fromParty} size="sm" />
                  <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <PartyBadge party={toParty} size="sm" />
                  <span className="text-xs text-muted-foreground ml-auto">{year}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No defections recorded.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function DefectionComparison({ politicians }: DefectionComparisonProps) {
  return (
    <div className="space-y-6">
      <DefectionsChart politicians={politicians} />

      <div className="grid md:grid-cols-2 gap-4">
        {politicians.map((p) => (
          <DefectionHistory key={p.id} politician={p} />
        ))}
      </div>
    </div>
  )
}
