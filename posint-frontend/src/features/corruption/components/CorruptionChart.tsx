"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

const corruptionByYear = [
  { year: 2018, cases: 45, convictions: 8, amountRecovered: 2.5 },
  { year: 2019, cases: 52, convictions: 12, amountRecovered: 4.2 },
  { year: 2020, cases: 38, convictions: 6, amountRecovered: 1.8 },
  { year: 2021, cases: 61, convictions: 15, amountRecovered: 5.6 },
  { year: 2022, cases: 73, convictions: 18, amountRecovered: 8.3 },
  { year: 2023, cases: 87, convictions: 22, amountRecovered: 12.1 },
]

const corruptionByAgency = [
  { name: "EFCC", cases: 234, convictions: 67 },
  { name: "ICPC", cases: 156, convictions: 34 },
]

export function CorruptionChart() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Corruption Cases Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={corruptionByYear}>
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
            <BarChart data={corruptionByAgency}>
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
