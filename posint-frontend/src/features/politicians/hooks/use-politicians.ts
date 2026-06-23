import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiGet, apiPost, apiPatch, apiDelete } from "@/shared/lib/api"
import { toast } from "sonner"
import type { PoliticianListResponse, PoliticianDetail, PoliticiansStats } from "../api/politicians.types"

export function usePoliticians(filters: Partial<{
  page: number
  limit: number
  party: string | null
  state: string | null
  chamber: string | null
  search: string | null
  sortBy: string
  sortOrder: string
}> = {}) {
  return useQuery({
    queryKey: ["politicians", filters],
    queryFn: () =>
      apiGet<PoliticianListResponse>("/politicians", {
        page: filters.page ?? 1,
        limit: filters.limit ?? 20,
        ...(filters.party && { party: filters.party }),
        ...(filters.state && { state: filters.state }),
        ...(filters.chamber && { chamber: filters.chamber }),
        ...(filters.search && { search: filters.search }),
        sortBy: filters.sortBy ?? "name",
        sortOrder: filters.sortOrder ?? "asc",
      }),
    placeholderData: (prev) => prev,
  })
}

export function usePoliticianBySlug(slug: string) {
  return useQuery({
    queryKey: ["politician", slug],
    queryFn: () => apiGet<PoliticianDetail>(`/politicians/${slug}`),
    enabled: !!slug,
  })
}

export function usePoliticianStats() {
  return useQuery({
    queryKey: ["politicians-stats"],
    queryFn: () => apiGet<PoliticiansStats>("/politicians/stats"),
    staleTime: 1000 * 60 * 15,
  })
}

export function usePoliticianVotingRecords(slug: string) {
  return useQuery({
    queryKey: ["politician-voting", slug],
    queryFn: () => apiGet<any[]>(`/politicians/${slug}/voting-records`),
    enabled: !!slug,
  })
}

export function usePoliticianBills(slug: string) {
  return useQuery({
    queryKey: ["politician-bills", slug],
    queryFn: () => apiGet<any[]>(`/politicians/${slug}/bills`),
    enabled: !!slug,
  })
}

export function usePoliticianAssets(slug: string) {
  return useQuery({
    queryKey: ["politician-assets", slug],
    queryFn: () => apiGet<any[]>(`/politicians/${slug}/assets`),
    enabled: !!slug,
  })
}

export function usePoliticianProjects(slug: string) {
  return useQuery({
    queryKey: ["politician-projects", slug],
    queryFn: () => apiGet<any[]>(`/politicians/${slug}/projects`),
    enabled: !!slug,
  })
}

export function usePoliticianDefections(slug: string) {
  return useQuery({
    queryKey: ["politician-defections", slug],
    queryFn: () => apiGet<any[]>(`/politicians/${slug}/defections`),
    enabled: !!slug,
  })
}

export function usePoliticianCareer(slug: string) {
  return useQuery({
    queryKey: ["politician-career", slug],
    queryFn: () => apiGet<any[]>(`/politicians/${slug}/career`),
    enabled: !!slug,
  })
}

export function usePoliticianCommittees(slug: string) {
  return useQuery({
    queryKey: ["politician-committees", slug],
    queryFn: () => apiGet<any[]>(`/politicians/${slug}/committees`),
    enabled: !!slug,
  })
}

export function usePoliticianSocial(slug: string) {
  return useQuery({
    queryKey: ["politician-social", slug],
    queryFn: () => apiGet<{ posts: any[]; stats: any }>(`/politicians/${slug}/social`),
    enabled: !!slug,
  })
}

export function useCreatePolitician() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => apiPost<PoliticianDetail>("/politicians", body),
    onSuccess: () => {
      toast.success("Politician created")
      queryClient.invalidateQueries({ queryKey: ["politicians"] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create politician")
    },
  })
}

export function useUpdatePolitician() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      apiPatch<PoliticianDetail>(`/politicians/${id}`, body),
    onSuccess: () => {
      toast.success("Politician updated")
      queryClient.invalidateQueries({ queryKey: ["politicians"] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to update politician")
    },
  })
}

export function useDeletePolitician() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiDelete(`/politicians/${id}`),
    onSuccess: () => {
      toast.success("Politician deleted")
      queryClient.invalidateQueries({ queryKey: ["politicians"] })
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete politician")
    },
  })
}
