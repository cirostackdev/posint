"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

interface ByYearEntry {
  year: number
  cases: number
  convictions: number
}

interface ByAgencyEntry {
  agency: string
  cases: number
  convictions: number
}

interface CorruptionChartProps {
  byYear?: ByYearEntry[]
  byAgency?: ByAgencyEntry[]
}

export function CorruptionChart({ byYear = [], byAgency = [] }: CorruptionChartProps) {
  const yearData = [...byYear].reverse()
  const agencyData = byAgency.map(a => ({ name: a.agency, cases: a.cases, convictions: a.convictions }))

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
