"use client"

import { TrendingUp, TrendingDown, Users, MessageCircle, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts"
import type { SocialStats, SentimentPoint, TopicMention } from "../api/social.types"

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M"
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K"
  return num.toString()
}

function getSentimentLabel(score: number): string {
  if (score >= 0.5) return "Very Positive"
  if (score >= 0.2) return "Positive"
  if (score >= -0.2) return "Mixed"
  if (score >= -0.5) return "Negative"
  return "Very Negative"
}

function getSentimentColor(score: number): string {
  if (score >= 0.2) return "text-status-success"
  if (score >= -0.2) return "text-status-warning"
  return "text-status-danger"
}

function getTopicBarColor(sentiment: number): string {
  if (sentiment >= 0.3) return "hsl(142, 70%, 45%)"
  if (sentiment >= -0.3) return "hsl(38, 92%, 50%)"
  return "hsl(0, 72%, 51%)"
}

/** Aggregate raw SentimentPoint[] into monthly buckets suitable for recharts */
function buildTimelineData(points: SentimentPoint[]) {
  const buckets: Record<string, { positive: number; negative: number; neutral: number; total: number }> = {}

  for (const p of points) {
    const month = new Date(p.publishedAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    if (!buckets[month]) buckets[month] = { positive: 0, negative: 0, neutral: 0, total: 0 }
    buckets[month].total += 1
    const s = p.sentiment.toUpperCase()
    if (s === "POSITIVE") buckets[month].positive += 1
    else if (s === "NEGATIVE") buckets[month].negative += 1
    else buckets[month].neutral += 1
  }

  return Object.entries(buckets).map(([month, v]) => ({
    month,
    positive: v.total ? Math.round((v.positive / v.total) * 100) : 0,
    negative: v.total ? Math.round((v.negative / v.total) * 100) : 0,
    neutral: v.total ? Math.round((v.neutral / v.total) * 100) : 0,
  }))
}

interface PublicSentimentProps {
  stats: SocialStats | null | undefined
  sentimentTimeline?: SentimentPoint[]
  topics?: TopicMention[]
  politicianName: string
}

export function PublicSentiment({ stats, sentimentTimeline = [], topics = [], politicianName }: PublicSentimentProps) {
  const overallSentiment = stats?.overallSentiment ?? 0
  const timelineData = buildTimelineData(sentimentTimeline)

  return (
    <div className="space-y-6">
      {/* Sentiment Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-display font-bold ${getSentimentColor(overallSentiment)}`}>
              {overallSentiment > 0 ? "+" : ""}{(overallSentiment * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">
              {getSentimentLabel(overallSentiment)}
            </p>
            <div className="mt-2">
              {overallSentiment >= 0 ? (
                <TrendingUp className="h-4 w-4 mx-auto text-status-success" />
              ) : (
                <TrendingDown className="h-4 w-4 mx-auto text-status-danger" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-display font-bold text-foreground">
              {stats ? formatNumber(stats.totalMentions) : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Total Mentions</p>
            <MessageCircle className="h-4 w-4 mx-auto mt-2 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-display font-bold text-foreground">
              {stats ? formatNumber(stats.followerCount) : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Followers</p>
            <Users className="h-4 w-4 mx-auto mt-2 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-display font-bold text-primary">
              {stats ? `${Number(stats.engagementRate ?? 0).toFixed(1)}%` : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Engagement Rate</p>
            <BarChart3 className="h-4 w-4 mx-auto mt-2 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Over Time Chart */}
      {timelineData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Public Sentiment Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="gradPositive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 70%, 45%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradNegative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradNeutral" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(220, 10%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(220, 10%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 11 }}
                  />
                  <YAxis
                    tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 11 }}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(220, 25%, 12%)",
                      border: "1px solid hsl(220, 20%, 20%)",
                      borderRadius: "8px",
                      color: "hsl(220, 15%, 95%)",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="positive" stroke="hsl(142, 70%, 45%)" strokeWidth={2} fill="url(#gradPositive)" name="Positive" />
                  <Area type="monotone" dataKey="negative" stroke="hsl(0, 72%, 51%)" strokeWidth={2} fill="url(#gradNegative)" name="Negative" />
                  <Area type="monotone" dataKey="neutral" stroke="hsl(220, 10%, 50%)" strokeWidth={2} fill="url(#gradNeutral)" name="Neutral" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Topics & Sentiment Breakdown */}
      {topics.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Discussion Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topics}
                    layout="vertical"
                    margin={{ left: 0, right: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 11 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="topic"
                      width={130}
                      tick={{ fill: "hsl(220, 10%, 45%)", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(220, 25%, 12%)",
                        border: "1px solid hsl(220, 20%, 20%)",
                        borderRadius: "8px",
                        color: "hsl(220, 15%, 95%)",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [formatNumber(value), "Mentions"]}
                    />
                    <Bar dataKey="mentionCount" radius={[0, 4, 4, 0]} name="Mentions">
                      {topics.map((entry, index) => (
                        <Cell key={index} fill={getTopicBarColor(Number(entry.avgSentiment ?? 0))} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sentiment Breakdown by Topic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topics.map((topic) => {
                const sentiment = Number(topic.avgSentiment ?? 0)
                const sentimentPercent = ((sentiment + 1) / 2) * 100
                return (
                  <div key={topic.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{topic.topic}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatNumber(topic.mentionCount)} mentions
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            sentiment >= 0.3
                              ? "bg-status-success/15 text-status-success border-status-success/30"
                              : sentiment >= -0.3
                              ? "bg-status-warning/15 text-status-warning border-status-warning/30"
                              : "bg-status-danger/15 text-status-danger border-status-danger/30"
                          }`}
                        >
                          {sentiment > 0 ? "+" : ""}{(sentiment * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={sentimentPercent} className="h-2" />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Data Source Disclaimer */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground text-center">
            Sentiment data is aggregated from public social media posts, news articles, and online discussions about{" "}
            <span className="font-medium text-foreground">{politicianName}</span>.
            Analysis uses natural language processing to classify sentiment.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
