"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { TopicMention } from "../api/social.types"

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M"
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K"
  return num.toString()
}

function getTopicBarColor(sentiment: number): string {
  if (sentiment >= 0.3) return "hsl(142, 70%, 45%)"
  if (sentiment >= -0.3) return "hsl(38, 92%, 50%)"
  return "hsl(0, 72%, 51%)"
}

interface TopicCloudProps {
  topics: TopicMention[]
}

export function TopicCloud({ topics }: TopicCloudProps) {
  if (!topics.length) return null

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Top Discussion Topics Bar Chart */}
      <Card className="border-border/50">
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

      {/* Sentiment Breakdown by Topic */}
      <Card className="border-border/50">
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
  )
}
