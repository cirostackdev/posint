"use client"

import { ArrowRight, Repeat } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { EmptyState } from "@/shared/components/shared/EmptyState"
import { GitBranch } from "lucide-react"
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
import type { PartyDefection } from "../api/politicians.types"

const partyColors: Record<string, string> = {
  APC: "hsl(210, 80%, 55%)",
  PDP: "hsl(0, 72%, 51%)",
  LP: "hsl(142, 70%, 45%)",
  NNPP: "hsl(38, 92%, 50%)",
  APGA: "hsl(280, 60%, 50%)",
  SDP: "hsl(320, 60%, 50%)",
  ANPP: "hsl(180, 60%, 45%)",
  ACN: "hsl(45, 80%, 50%)",
  APP: "hsl(200, 50%, 50%)",
  AD: "hsl(100, 50%, 45%)",
  DPP: "hsl(260, 50%, 50%)",
}

type PartyVariant = "apc" | "pdp" | "lp" | "nnpp" | "apga" | "outline"

function partyBadgeVariant(party: string): PartyVariant {
  const map: Record<string, PartyVariant> = {
    APC: "apc",
    PDP: "pdp",
    LP: "lp",
    NNPP: "nnpp",
    APGA: "apga",
  }
  return map[party] || "outline"
}

interface DefectionHistoryProps {
  defections: PartyDefection[]
  currentParty: string
  politicianName: string
}

export function DefectionHistory({ defections, currentParty, politicianName }: DefectionHistoryProps) {
  if (defections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Party Defection History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            {politicianName} has no recorded party defections. Currently a member of {currentParty}.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Sort defections by date ascending for timeline
  const sortedDefections = [...defections].sort(
    (a, b) => new Date(a.defectionDate).getTime() - new Date(b.defectionDate).getTime()
  )

  // Build party stints for bar chart
  const partyStints: { party: string; startYear: number; endYear: number; years: number }[] = []

  const firstDefection = sortedDefections[0]
  const firstFromParty = firstDefection.fromParty?.abbreviation ?? "Unknown"
  const firstYear = new Date(firstDefection.defectionDate).getFullYear()
  const estimatedStart = firstYear - 4
  partyStints.push({
    party: firstFromParty,
    startYear: estimatedStart,
    endYear: firstYear,
    years: firstYear - estimatedStart,
  })

  for (let i = 0; i < sortedDefections.length; i++) {
    const toParty = sortedDefections[i].toParty?.abbreviation ?? "Unknown"
    const startYear = new Date(sortedDefections[i].defectionDate).getFullYear()
    const endYear =
      i < sortedDefections.length - 1
        ? new Date(sortedDefections[i + 1].defectionDate).getFullYear()
        : 2026
    partyStints.push({
      party: toParty,
      startYear,
      endYear,
      years: endYear - startYear,
    })
  }

  const chartData = partyStints.map((s) => ({
    name: `${s.party} (${s.startYear}–${s.endYear === 2026 ? "Present" : s.endYear})`,
    years: s.years,
    party: s.party,
  }))

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Repeat className="h-5 w-5" />
            Party Defection History
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {defections.length} defection{defections.length > 1 ? "s" : ""} recorded
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedDefections.map((defection, index) => {
              const fromParty = defection.fromParty?.abbreviation ?? "Unknown"
              const toParty = defection.toParty?.abbreviation ?? "Unknown"
              const year = new Date(defection.defectionDate).getFullYear()

              return (
                <div
                  key={defection.id}
                  className="relative flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border/50"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant={partyBadgeVariant(fromParty)} className="text-xs">
                        {fromParty}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Badge variant={partyBadgeVariant(toParty)} className="text-xs">
                        {toParty}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{year}</span>
                    </div>
                    {defection.reason && (
                      <p className="text-sm text-muted-foreground">{defection.reason}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Years per Party</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  label={{ value: "Years", position: "bottom", fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={180}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => [`${value} years`, "Duration"]}
                />
                <Bar dataKey="years" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={partyColors[entry.party] || "hsl(var(--primary))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
