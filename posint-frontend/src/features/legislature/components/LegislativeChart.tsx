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

export function LegislativeChart({ data }: LegislativeChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Legislative Activity Trend</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground text-sm">No bill data available for the past 12 months.</p>
        </CardContent>
      </Card>
    )
  }
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
