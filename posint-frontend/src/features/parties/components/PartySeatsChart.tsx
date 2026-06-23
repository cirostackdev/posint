"use client"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import type { SeatDistribution } from "../api/parties.types"

// ─── PartyPieChart (donut) ─────────────────────────────────────────────────

interface PartySeatsChartProps {
  data: SeatDistribution[]
  title?: string
  dataKey?: "seatsTotal" | "governors"
}

export function PartySeatsChart({
  data,
  title = "Seat Distribution",
  dataKey = "seatsTotal",
}: PartySeatsChartProps) {
  if (!data.length) return null

  const total = data.reduce((sum, item) => {
    const v = item[dataKey as keyof SeatDistribution]
    return sum + (typeof v === "number" ? v : 0)
  }, 0)

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey={dataKey}
              nameKey="abbreviation"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  className="stroke-background stroke-2"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [
                `${value} (${((value / total) * 100).toFixed(1)}%)`,
                dataKey === "seatsTotal" ? "Seats" : "Governors",
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-foreground text-sm">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// ─── ChamberBarChart ───────────────────────────────────────────────────────

interface ChamberBarChartProps {
  data: SeatDistribution[]
}

export function ChamberBarChart({ data }: ChamberBarChartProps) {
  if (!data.length) return null

  const chamberData = [
    {
      chamber: "Senate",
      ...Object.fromEntries(
        data.map((p) => [p.abbreviation, p.senateSeats ?? 0])
      ),
    },
    {
      chamber: "House",
      ...Object.fromEntries(
        data.map((p) => [p.abbreviation, p.houseSeats ?? 0])
      ),
    },
  ]

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Party Distribution by Chamber</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chamberData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              dataKey="chamber"
              type="category"
              width={60}
              stroke="hsl(var(--muted-foreground))"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend />
            {data.map((p) => (
              <Bar key={p.abbreviation} dataKey={p.abbreviation} fill={p.color} stackId="a" />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
