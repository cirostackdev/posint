"use client"

import { Heart, MessageCircle, Share2, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { EmptyState } from "@/shared/components/shared/EmptyState"
import { cn, formatDate } from "@/shared/lib/utils"
import type { SocialPost } from "../api/social.types"

const platformIcons: Record<string, React.ReactNode> = {
  TWITTER: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  FACEBOOK: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  INSTAGRAM: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
}

const platformColors: Record<string, string> = {
  TWITTER: "bg-foreground/10 text-foreground",
  FACEBOOK: "bg-info/10 text-info",
  INSTAGRAM: "bg-destructive/10 text-destructive",
  TIKTOK: "bg-muted text-muted-foreground",
  YOUTUBE: "bg-destructive/10 text-destructive",
}

const platformLabels: Record<string, string> = {
  TWITTER: "X (Twitter)",
  FACEBOOK: "Facebook",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
}

const sentimentColors: Record<string, string> = {
  POSITIVE: "bg-status-success/15 text-status-success border-status-success/30",
  NEGATIVE: "bg-status-danger/15 text-status-danger border-status-danger/30",
  NEUTRAL: "bg-muted text-muted-foreground border-border",
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M"
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K"
  return num.toString()
}

interface SocialMediaPostsProps {
  posts: SocialPost[]
}

export function SocialMediaPosts({ posts }: SocialMediaPostsProps) {
  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        icon={MessageCircle}
        title="No social media posts"
        description="No social media posts found for this politician."
      />
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Recent Social Media Posts
            <Badge variant="outline" className="ml-auto font-normal text-xs">
              {posts.length} posts extracted
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-lg", platformColors[post.platform] ?? "bg-muted text-muted-foreground")}>
                    {platformIcons[post.platform] ?? <MessageCircle className="h-4 w-4" />}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {platformLabels[post.platform] ?? post.platform}
                  </span>
                  {post.isByPolitician && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <Badge variant="secondary" className="text-xs">Official</Badge>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</span>
                </div>
                <Badge
                  variant="outline"
                  className={cn("text-xs", sentimentColors[post.sentiment] ?? "bg-muted text-muted-foreground border-border")}
                >
                  {post.sentiment.toLowerCase()}
                </Badge>
              </div>

              {/* Post Content */}
              <p className="text-sm text-foreground/90 leading-relaxed mb-3">{post.content}</p>

              {/* Engagement Stats */}
              <div className="flex items-center gap-5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5" />
                  {formatNumber(post.likes)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Share2 className="h-3.5 w-3.5" />
                  {formatNumber(post.shares)}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {formatNumber(post.comments)}
                </span>
                {post.url && (
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto flex items-center gap-1 text-primary hover:underline"
                  >
                    View <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
