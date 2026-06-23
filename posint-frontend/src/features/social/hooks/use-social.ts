import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/shared/lib/api"
import type { SocialPost, SentimentPoint, TopicMention, SocialStats } from "../api/social.types"

export function useSocialPosts(politicianId: string) {
  return useQuery({
    queryKey: ["social-posts", politicianId],
    queryFn: () => apiGet<SocialPost[]>(`/social/${politicianId}/posts`, { limit: 20 }),
    enabled: !!politicianId,
  })
}

export function useSentiment(politicianId: string) {
  return useQuery({
    queryKey: ["social-sentiment", politicianId],
    queryFn: () => apiGet<SentimentPoint[]>(`/social/${politicianId}/sentiment`),
    enabled: !!politicianId,
  })
}

export function useTopics(politicianId: string) {
  return useQuery({
    queryKey: ["social-topics", politicianId],
    queryFn: () => apiGet<TopicMention[]>(`/social/${politicianId}/topics`),
    enabled: !!politicianId,
  })
}

export function useSocialStats(politicianId: string) {
  return useQuery({
    queryKey: ["social-stats", politicianId],
    queryFn: () => apiGet<SocialStats>(`/social/${politicianId}/stats`),
    enabled: !!politicianId,
  })
}
