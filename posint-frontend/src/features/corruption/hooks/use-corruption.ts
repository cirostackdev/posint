import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost, apiPatch, apiDelete } from "@/shared/lib/api"
import { toast } from "sonner"
import type { CaseListResponse, CorruptionCase, CorruptionStats } from "../api/corruption.types"

export function useCases(filters: { page?: number; agency?: string | null; status?: string | null; year?: number | null; search?: string | null } = {}) {
  return useQuery({
    queryKey: ["cases", filters],
    queryFn: () =>
      apiGet<CaseListResponse>("/corruption/cases", {
        page: filters.page ?? 1, limit: 20,
        ...(filters.agency && { agency: filters.agency }),
        ...(filters.status && { status: filters.status }),
        ...(filters.year && { year: filters.year }),
        ...(filters.search && { search: filters.search }),
      }),
    placeholderData: (prev) => prev,
  })
}

export function useCaseById(id: string) {
  return useQuery({
    queryKey: ["case", id],
    queryFn: () => apiGet<CorruptionCase>(`/corruption/cases/${id}`),
    enabled: !!id,
  })
}

export function useCorruptionStats() {
  return useQuery({
    queryKey: ["corruption-stats"],
    queryFn: () => apiGet<CorruptionStats>("/corruption/cases/stats"),
    staleTime: 1000 * 60 * 15,
  })
}

export function useCreateCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => apiPost<CorruptionCase>("/corruption/cases", body),
    onSuccess: () => {
      toast.success("Case created")
      queryClient.invalidateQueries({ queryKey: ["cases"] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create case")
    },
  })
}

export function useUpdateCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      apiPatch<CorruptionCase>(`/corruption/cases/${id}`, body),
    onSuccess: () => {
      toast.success("Case updated")
      queryClient.invalidateQueries({ queryKey: ["cases"] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update case")
    },
  })
}

export function useDeleteCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/corruption/cases/${id}`),
    onSuccess: () => {
      toast.success("Case deleted")
      queryClient.invalidateQueries({ queryKey: ["cases"] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete case")
    },
  })
}
