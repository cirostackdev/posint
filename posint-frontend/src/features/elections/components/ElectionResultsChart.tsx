"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import type { Election } from "../api/elections.types"

const partyColors: Record<string, string> = {
  APC: "hsl(210, 80%, 55%)",
  PDP: "hsl(0, 72%, 51%)",
  LP: "hsl(142, 70%, 45%)",
  NNPP: "hsl(38, 92%, 50%)",
  APGA: "hsl(280, 60%, 50%)",
  CPC: "hsl(180, 50%, 45%)",
  ANPP: "hsl(200, 50%, 50%)",
  SDP: "hsl(320, 60%, 50%)",
}

interface ElectionResultsChartProps {
  data: Election[]
  title?: string
}

export function ElectionResultsChart({ data, title = "Election Results" }: ElectionResultsChartProps) {
  if (data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Select elections to view charts</p>
        </CardContent>
      </Card>
    )
  }

  const getPartyAbbr = (e: Election) => e.winnerParty?.abbreviation ?? e.winnerPartyId ?? "OTHER"

  // Party wins breakdown
  const partyWins: Record<string, number> = {}
  data.forEach((e) => {
    const party = getPartyAbbr(e)
    partyWins[party] = (partyWins[party] || 0) + 1
  })
  const pieData = Object.entries(partyWins)
    .map(([party, count]) => ({ name: party, value: count, fill: partyColors[party] || "hsl(220, 10%, 50%)" }))
    .sort((a, b) => b.value - a.value)

  // Vote totals — top 12 by totalVotes
  const barData = [...data]
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 12)
    .map((e) => {
      const label = e.state
        ? `${e.state} ${e.type} (${e.year})`
        : `${e.type} (${e.year})`
      return {
        label: label.length > 30 ? label.slice(0, 27) + "..." : label,
        votes: e.winnerVotes,
        totalVotes: e.totalVotes,
        party: getPartyAbbr(e),
        winner: e.winnerName,
        margin: e.margin ?? "",
      }
    })

  // Candidates tab — first election that has more than 1 candidate
  const electionWithCandidates = data.find((e) => e.candidates && e.candidates.length > 1)

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {data.length} election{data.length !== 1 ? "s" : ""} shown
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="party" className="space-y-4">
          <TabsList>
            <TabsTrigger value="party">Party Wins</TabsTrigger>
            <TabsTrigger value="votes">Vote Totals</TabsTrigger>
            {electionWithCandidates && <TabsTrigger value="candidates">Candidates</TabsTrigger>}
          </TabsList>

          <TabsContent value="party">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [`${value} wins`, "Elections Won"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="votes">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(v) =>
                      v >= 1_000_000
                        ? `${(v / 1_000_000).toFixed(1)}M`
                        : v >= 1_000
                        ? `${(v / 1_000).toFixed(0)}K`
                        : v.toString()
                    }
                  />
                  <YAxis
                    dataKey="label"
                    type="category"
                    width={200}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number, _name: string, props: any) => {
                      const item = props.payload
                      return [`${value.toLocaleString()} votes (${item.margin})`, `Winner: ${item.winner}`]
                    }}
                  />
                  <Bar dataKey="votes" name="Winner Votes" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={partyColors[entry.party] || "hsl(220, 10%, 50%)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {electionWithCandidates && (
            <TabsContent value="candidates">
              <div className="space-y-2 mb-2">
                <p className="text-sm font-medium">
                  {electionWithCandidates.state ? `${electionWithCandidates.state} ` : ""}
                  {electionWithCandidates.type} ({electionWithCandidates.year})
                </p>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={electionWithCandidates.candidates!.map((c) => ({
                      name: c.candidateName,
                      votes: c.votes,
                      party: c.party?.abbreviation ?? "",
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(v) =>
                        v >= 1_000_000
                          ? `${(v / 1_000_000).toFixed(1)}M`
                          : v >= 1_000
                          ? `${(v / 1_000).toFixed(0)}K`
                          : v.toString()
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                      formatter={(value: number) => [value.toLocaleString(), "Votes"]}
                    />
                    <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                      {electionWithCandidates.candidates!.map((c, i) => (
                        <Cell key={i} fill={partyColors[c.party?.abbreviation ?? ""] || "hsl(220, 10%, 50%)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
