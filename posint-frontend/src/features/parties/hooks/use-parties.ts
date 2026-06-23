import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost, apiPatch } from "@/shared/lib/api"
import { toast } from "sonner"
import type { Party, PartyDetail, SeatDistribution } from "../api/parties.types"

export function useParties() {
  return useQuery({
    queryKey: ["parties"],
    queryFn: () => apiGet<Party[]>("/parties"),
    staleTime: 1000 * 60 * 30,
  })
}

export function usePartyBySlug(slug: string) {
  return useQuery({
    queryKey: ["party", slug],
    queryFn: () => apiGet<PartyDetail>(`/parties/${slug}`),
    enabled: !!slug,
  })
}

export function useSeatDistribution() {
  return useQuery({
    queryKey: ["seat-distribution"],
    queryFn: () => apiGet<SeatDistribution[]>("/parties/seat-distribution"),
    staleTime: 1000 * 60 * 30,
  })
}

export function useCreateParty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => apiPost<Party>("/parties", body),
    onSuccess: () => {
      toast.success("Party created")
      queryClient.invalidateQueries({ queryKey: ["parties"] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create party")
    },
  })
}

export function useUpdateParty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      apiPatch<Party>(`/parties/${id}`, body),
    onSuccess: () => {
      toast.success("Party updated")
      queryClient.invalidateQueries({ queryKey: ["parties"] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update party")
    },
  })
}
