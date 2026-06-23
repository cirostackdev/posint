import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost, apiPatch, apiDelete } from "@/shared/lib/api"
import { toast } from "sonner"
import type { BillListResponse, LegislativeBill, LegislatureStats } from "../api/legislature.types"

export function useBills(filters: { page?: number; status?: string | null; chamber?: string | null; search?: string | null } = {}) {
  return useQuery({
    queryKey: ["bills", filters],
    queryFn: () =>
      apiGet<BillListResponse>("/legislature/bills", {
        page: filters.page ?? 1,
        limit: 20,
        ...(filters.status && { status: filters.status }),
        ...(filters.chamber && { chamber: filters.chamber }),
        ...(filters.search && { search: filters.search }),
      }),
    placeholderData: (prev) => prev,
  })
}

export function useBillById(id: string) {
  return useQuery({
    queryKey: ["bill", id],
    queryFn: () => apiGet<LegislativeBill>(`/legislature/bills/${id}`),
    enabled: !!id,
  })
}

export function useLegislatureStats() {
  return useQuery({
    queryKey: ["legislature-stats"],
    queryFn: () => apiGet<LegislatureStats>("/legislature/bills/stats"),
    staleTime: 1000 * 60 * 15,
  })
}

export function useCreateBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => apiPost<LegislativeBill>("/legislature/bills", body),
    onSuccess: () => {
      toast.success("Bill created")
      queryClient.invalidateQueries({ queryKey: ["bills"] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create bill")
    },
  })
}

export function useUpdateBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      apiPatch<LegislativeBill>(`/legislature/bills/${id}`, body),
    onSuccess: () => {
      toast.success("Bill updated")
      queryClient.invalidateQueries({ queryKey: ["bills"] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update bill")
    },
  })
}

export function useDeleteBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/legislature/bills/${id}`),
    onSuccess: () => {
      toast.success("Bill deleted")
      queryClient.invalidateQueries({ queryKey: ["bills"] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete bill")
    },
  })
}
