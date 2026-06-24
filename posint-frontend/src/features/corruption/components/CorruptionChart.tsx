"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { useCorruptionStats } from "@/features/corruption/hooks/use-corruption"

export function CorruptionChart() {
  const { data: stats, isLoading, error } = useCorruptionStats()

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Corruption Cases Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Cases by Agency</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Corruption Cases Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-status-danger">Failed to load chart data</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Cases by Agency</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-status-danger">Failed to load chart data</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const yearData = stats?.byYear ? [...stats.byYear].reverse() : []
  const agencyData = stats?.byAgency?.map(a => ({ name: a.agency, cases: a.cases, convictions: a.convictions })) ?? []

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Corruption Cases Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={yearData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="cases"
                stackId="1"
                stroke="hsl(var(--warning))"
                fill="hsl(var(--warning) / 0.3)"
                name="Total Cases"
              />
              <Area
                type="monotone"
                dataKey="convictions"
                stackId="2"
                stroke="hsl(var(--danger))"
                fill="hsl(var(--danger) / 0.3)"
                name="Convictions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Cases by Agency</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="cases" fill="hsl(var(--warning))" name="Cases Filed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="convictions" fill="hsl(var(--danger))" name="Convictions" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
