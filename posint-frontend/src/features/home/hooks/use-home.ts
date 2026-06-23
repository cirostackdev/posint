import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/shared/lib/api"

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => apiGet<{
      politicians: number
      parties: number
      elections: number
      bills: number
      billsPassed: number
      cases: number
      activeCases: number
      totalRecoveredKobo: string
    }>("/admin/stats"),
    staleTime: 1000 * 60 * 15,
  })
}
