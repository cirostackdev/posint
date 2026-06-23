export interface SocialPost {
  id: string
  platform: "TWITTER" | "FACEBOOK" | "INSTAGRAM"
  content: string
  url: string | null
  publishedAt: string
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL"
  sentimentScore: number | null
  engagementTotal: number
  likes: number
  shares: number
  comments: number
  isByPolitician: boolean
}

export interface SentimentPoint {
  publishedAt: string
  sentiment: string
  sentimentScore: number | null
}

export interface TopicMention {
  id: string
  topic: string
  mentionCount: number
  avgSentiment: number
}

export interface SocialStats {
  overallSentiment: number
  totalMentions: number
  followerCount: number
  engagementRate: number
}
