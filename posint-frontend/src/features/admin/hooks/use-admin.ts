"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { apiGet, apiPatch, apiPost } from "@/shared/lib/api"
import type { AdminStats, AdminUsersResponse, AuditLogResponse, DataSource, PipelineJob } from "../api/admin.types"

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiGet<AdminStats>("/admin/stats"),
    staleTime: 1000 * 60 * 2,
  })
}

export function useAdminUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["admin-users", page, limit],
    queryFn: () => apiGet<AdminUsersResponse>("/admin/users", { page, limit }),
    placeholderData: (prev) => prev,
  })
}

export function useAuditLog(page = 1) {
  return useQuery({
    queryKey: ["admin-audit-log", page],
    queryFn: () => apiGet<AuditLogResponse>("/admin/audit-log", { page }),
    placeholderData: (prev) => prev,
  })
}

export function useDataSources() {
  return useQuery({
    queryKey: ["admin-data-sources"],
    queryFn: () => apiGet<DataSource[]>("/admin/data-sources"),
    staleTime: 1000 * 60 * 2,
  })
}

export function usePipelineJobs() {
  return useQuery({
    queryKey: ["pipeline-jobs"],
    queryFn: () => apiGet<PipelineJob[]>("/pipeline/jobs"),
    refetchInterval: 60_000,
  })
}

const PIPELINE_TRIGGERS = [
  "nass",
  "efcc",
  "inec",
  "social",
  "sentiment",
  "stats",
] as const

export type PipelineTrigger = (typeof PIPELINE_TRIGGERS)[number]

export function useTriggerPipeline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (trigger: PipelineTrigger) =>
      apiPost<{ message: string }>(`/pipeline/trigger/${trigger}`, {}),
    onSuccess: (_data, trigger) => {
      toast.success(`Pipeline "${trigger}" triggered`)
      queryClient.invalidateQueries({ queryKey: ["pipeline-jobs"] })
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to trigger pipeline"
      toast.error(message)
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "USER" | "EDITOR" | "ADMIN" }) =>
      apiPatch(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      toast.success("Role updated")
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to update role"
      toast.error(message)
    },
  })
}
