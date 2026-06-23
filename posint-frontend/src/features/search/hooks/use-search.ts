import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/shared/lib/api"

export interface SearchResult {
  entityType: "politician" | "bill" | "case" | "election"
  entityId: string
  slug?: string
  title: string
  subtitle: string
}

export function useGlobalSearch(query: string, limit = 10) {
  return useQuery({
    queryKey: ["search", query, limit],
    queryFn: () => apiGet<SearchResult[]>("/search", { q: query, limit }),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 2,
  })
}
