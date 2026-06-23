import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost, apiPatch, apiDelete } from "@/shared/lib/api"
import { toast } from "sonner"
import type { ElectionListResponse, Election, ElectionsStats } from "../api/elections.types"

export function useElections(filters: {
  page?: number
  level?: string | null
  year?: number | null
  state?: string | null
  party?: string | null
  search?: string | null
} = {}) {
  return useQuery({
    queryKey: ["elections", filters],
    queryFn: () =>
      apiGet<ElectionListResponse>("/elections", {
        page: filters.page ?? 1,
        limit: 20,
        ...(filters.level && { level: filters.level }),
        ...(filters.year && { year: filters.year }),
        ...(filters.state && { state: filters.state }),
        ...(filters.party && { party: filters.party }),
        ...(filters.search && { search: filters.search }),
      }),
    placeholderData: (prev) => prev,
  })
}

export function useElectionById(id: string) {
  return useQuery({
    queryKey: ["election", id],
    queryFn: () => apiGet<Election>(`/elections/${id}`),
    enabled: !!id,
  })
}

export function useElectionsStats() {
  return useQuery({
    queryKey: ["elections-stats"],
    queryFn: () => apiGet<ElectionsStats>("/elections/stats"),
    staleTime: 1000 * 60 * 15,
  })
}

export function useCreateElection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => apiPost<Election>("/elections", body),
    onSuccess: () => {
      toast.success("Election created")
      queryClient.invalidateQueries({ queryKey: ["elections"] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create election")
    },
  })
}

export function useUpdateElection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      apiPatch<Election>(`/elections/${id}`, body),
    onSuccess: () => {
      toast.success("Election updated")
      queryClient.invalidateQueries({ queryKey: ["elections"] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update election")
    },
  })
}

export function useDeleteElection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/elections/${id}`),
    onSuccess: () => {
      toast.success("Election deleted")
      queryClient.invalidateQueries({ queryKey: ["elections"] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete election")
    },
  })
}
