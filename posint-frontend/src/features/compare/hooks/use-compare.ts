import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/shared/lib/api"

export function useCompareMetrics(ids: string[]) {
  return useQuery({
    queryKey: ["compare", ids.sort().join(",")],
    queryFn: () => apiGet<{ politicians: any[] }>(`/compare/metrics?ids=${ids.join(",")}`),
    enabled: ids.length >= 2,
  })
}
