"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { usePoliticianSocial } from "@/features/politicians/hooks/use-politicians"
import type { Politician } from "@/features/politicians/api/politicians.types"

interface SentimentComparisonProps {
  politicians: Politician[]
}

const COLORS = [
  "hsl(152, 60%, 25%)",
  "hsl(210, 80%, 55%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 72%, 51%)",
]

function getSentimentLabel(score: number) {
  if (score > 0.5) return { text: "Very Positive", className: "bg-status-success/20 text-status-success" }
  if (score > 0.2) return { text: "Positive", className: "bg-status-success/20 text-status-success" }
  if (score > -0.2) return { text: "Mixed", className: "bg-status-warning/20 text-status-warning" }
  return { text: "Negative", className: "bg-status-danger/20 text-status-danger" }
}

function PoliticianSentimentCard({ politician }: { politician: Politician }) {
  const { data: socialData, isLoading } = usePoliticianSocial(politician.slug)
  const socialStats = socialData?.stats ?? null

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!socialStats) {
    return (
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground truncate">{politician.name}</span>
            <Badge variant="outline" className="bg-muted/50 text-muted-foreground">
              No Data
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground text-center py-4">
            Social data not available
          </p>
        </CardContent>
      </Card>
    )
  }

  const label = getSentimentLabel(socialStats.overallSentiment)

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground truncate">{politician.name}</span>
          <Badge variant="outline" className={label.className}>
            {label.text}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Sentiment Score</span>
            <span>{(socialStats.overallSentiment * 100).toFixed(0)}%</span>
          </div>
          <Progress
            value={Math.max(0, (socialStats.overallSentiment + 1) * 50)}
            className="h-2"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="font-semibold text-foreground">{(socialStats.followerCount / 1000000).toFixed(1)}M</p>
            <p className="text-muted-foreground">Followers</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">{(socialStats.totalMentions / 1000).toFixed(0)}K</p>
            <p className="text-muted-foreground">Mentions</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">{socialStats.engagementRate}%</p>
            <p className="text-muted-foreground">Engage.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SentimentChartInner({ politicians }: { politicians: Politician[] }) {
  // Fixed-length hook calls to satisfy Rules of Hooks
  const p0 = usePoliticianSocial(politicians[0]?.slug ?? "")
  const p1 = usePoliticianSocial(politicians[1]?.slug ?? "")
  const p2 = usePoliticianSocial(politicians[2]?.slug ?? "")
  const p3 = usePoliticianSocial(politicians[3]?.slug ?? "")

  const allQueries = [
    { politician: politicians[0], ...p0 },
    { politician: politicians[1], ...p1 },
    { politician: politicians[2], ...p2 },
    { politician: politicians[3], ...p3 },
  ].filter((q) => q.politician)

  const isLoading = allQueries.some((q) => q.isLoading)

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />
  }

  const sentimentChartData = allQueries
    .filter((q) => q.data?.stats)
    .map((q) => {
      const stats = q.data!.stats
      // TODO: wire per-month breakdown when API exposes sentiment timeline
      return {
        name: q.politician!.name.split(" ").pop(),
        positive: Math.round(Math.max(0, stats.overallSentiment) * 100),
        negative: Math.round(Math.max(0, -stats.overallSentiment) * 100),
        neutral: Math.round((1 - Math.abs(stats.overallSentiment)) * 100),
      }
    })

  if (sentimentChartData.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        No sentiment data available for selected politicians.
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sentimentChartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
        />
        <Legend />
        <Bar dataKey="positive" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="negative" fill="hsl(var(--danger))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="neutral" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function SentimentChart({ politicians }: { politicians: Politician[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Sentiment Breakdown (Latest Month)</CardTitle>
      </CardHeader>
      <CardContent>
        <SentimentChartInner politicians={politicians} />
      </CardContent>
    </Card>
  )
}

export function SentimentComparison({ politicians }: SentimentComparisonProps) {
  return (
    <div className="space-y-6">
      {/* Sentiment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {politicians.map((pol) => (
          <PoliticianSentimentCard key={pol.id} politician={pol} />
        ))}
      </div>

      {/* Sentiment Breakdown Chart */}
      <SentimentChart politicians={politicians} />
    </div>
  )
}
