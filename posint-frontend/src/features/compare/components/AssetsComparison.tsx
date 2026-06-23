"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { Politician, AssetDeclaration } from "@/features/politicians/api/politicians.types"
import { usePoliticianAssets } from "@/features/politicians/hooks/use-politicians"

interface AssetsComparisonProps {
  politicians: Politician[]
}

function parseKoboToMillions(val: string | number): number {
  const n = typeof val === "string" ? parseFloat(val) : val
  if (isNaN(n)) return 0
  // Assume value is in kobo: divide by 100 to get naira, then divide by 1,000,000 for millions
  return n / 100 / 1_000_000
}

function AssetsChartInner({ politicians }: { politicians: Politician[] }) {
  const p0 = usePoliticianAssets(politicians[0]?.slug ?? "")
  const p1 = usePoliticianAssets(politicians[1]?.slug ?? "")
  const p2 = usePoliticianAssets(politicians[2]?.slug ?? "")
  const p3 = usePoliticianAssets(politicians[3]?.slug ?? "")

  const assetQueries = [
    { politician: politicians[0], assets: (p0.data ?? []) as AssetDeclaration[], isLoading: p0.isLoading },
    { politician: politicians[1], assets: (p1.data ?? []) as AssetDeclaration[], isLoading: p1.isLoading },
    { politician: politicians[2], assets: (p2.data ?? []) as AssetDeclaration[], isLoading: p2.isLoading },
    { politician: politicians[3], assets: (p3.data ?? []) as AssetDeclaration[], isLoading: p3.isLoading },
  ].filter((q) => q.politician)

  const isLoading = assetQueries.some((q) => q.isLoading)

  if (isLoading) {
    return <Skeleton className="h-[280px] w-full" />
  }

  const chartData = assetQueries.map((q) => {
    const totalMillions = q.assets.reduce(
      (sum, a) => sum + parseKoboToMillions(a.estimatedValueKobo),
      0
    )
    return {
      name: q.politician!.name.split(" ").pop(),
      total: Math.round(totalMillions),
    }
  })

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip
          formatter={(value: number) => [`₦${value.toLocaleString()}M`, "Total Assets"]}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
        />
        <Bar dataKey="total" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function AssetsChart({ politicians }: { politicians: Politician[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Total Declared Assets (₦ Millions)</CardTitle>
      </CardHeader>
      <CardContent>
        <AssetsChartInner politicians={politicians} />
      </CardContent>
    </Card>
  )
}

function AssetsTableInner({ politicians }: { politicians: Politician[] }) {
  const p0 = usePoliticianAssets(politicians[0]?.slug ?? "")
  const p1 = usePoliticianAssets(politicians[1]?.slug ?? "")
  const p2 = usePoliticianAssets(politicians[2]?.slug ?? "")
  const p3 = usePoliticianAssets(politicians[3]?.slug ?? "")

  const assetQueries = [
    { politician: politicians[0], assets: (p0.data ?? []) as AssetDeclaration[], isLoading: p0.isLoading },
    { politician: politicians[1], assets: (p1.data ?? []) as AssetDeclaration[], isLoading: p1.isLoading },
    { politician: politicians[2], assets: (p2.data ?? []) as AssetDeclaration[], isLoading: p2.isLoading },
    { politician: politicians[3], assets: (p3.data ?? []) as AssetDeclaration[], isLoading: p3.isLoading },
  ].filter((q) => q.politician)

  const isLoading = assetQueries.some((q) => q.isLoading)

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />
  }

  const allCategories = new Set<string>()
  assetQueries.forEach((q) => {
    q.assets.forEach((a) => allCategories.add(a.category))
  })
  const categories = Array.from(allCategories)

  if (categories.length === 0) {
    return null
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          {assetQueries.map((q) => (
            <TableHead key={q.politician!.id} className="text-center min-w-[120px]">
              {q.politician!.name.split(" ").pop()}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((cat) => (
          <TableRow key={cat}>
            <TableCell className="font-medium">{cat}</TableCell>
            {assetQueries.map((q) => {
              const asset = q.assets.find((a) => a.category === cat)
              return (
                <TableCell key={q.politician!.id} className="text-center text-sm">
                  {asset ? (
                    <span className="font-semibold text-foreground">
                      ₦{Math.round(parseKoboToMillions(asset.estimatedValueKobo)).toLocaleString()}M
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function AssetsTable({ politicians }: { politicians: Politician[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Asset Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <AssetsTableInner politicians={politicians} />
      </CardContent>
    </Card>
  )
}

export function AssetsComparison({ politicians }: AssetsComparisonProps) {
  return (
    <div className="space-y-6">
      <AssetsChart politicians={politicians} />
      <AssetsTable politicians={politicians} />
    </div>
  )
}
