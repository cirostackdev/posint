"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

interface ChartData {
  month: string
  bills: number
  passed: number
  rejected: number
}

interface LegislativeChartProps {
  data?: ChartData[]
}

const DEFAULT_DATA: ChartData[] = [
  { month: "Jan", bills: 12, passed: 5, rejected: 2 },
  { month: "Feb", bills: 18, passed: 8, rejected: 3 },
  { month: "Mar", bills: 15, passed: 6, rejected: 4 },
  { month: "Apr", bills: 22, passed: 10, rejected: 5 },
  { month: "May", bills: 19, passed: 9, rejected: 3 },
  { month: "Jun", bills: 25, passed: 12, rejected: 6 },
]

export function LegislativeChart({ data = DEFAULT_DATA }: LegislativeChartProps) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Legislative Activity Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="bills"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))" }}
              name="Bills Introduced"
            />
            <Line
              type="monotone"
              dataKey="passed"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--success))" }}
              name="Passed"
            />
            <Line
              type="monotone"
              dataKey="rejected"
              stroke="hsl(var(--danger))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--danger))" }}
              name="Rejected"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
