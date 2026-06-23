export interface AdminStats {
  politicians: number
  parties: number
  elections: number
  bills: number
  billsPassed: number
  cases: number
  activeCases: number
  totalRecoveredKobo: string
  constituencyProjects: number
  partyDefections: number
  activePipelineJobs: number
  lastSyncAt: string | null
}

export interface AdminUser {
  id: string
  email: string
  displayName: string | null
  role: "USER" | "EDITOR" | "ADMIN"
  createdAt: string
  updatedAt: string
}

export interface AdminUsersResponse {
  items: AdminUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AuditLogEntry {
  id: string
  userId: string | null
  userEmail: string | null
  action: string
  resource: string
  resourceId: string | null
  details: Record<string, unknown> | null
  createdAt: string
}

export interface AuditLogResponse {
  items: AuditLogEntry[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type DataSourceStatus = "active" | "inactive" | "error" | "unknown"

export interface DataSource {
  id: string
  name: string
  type: string
  url: string | null
  status: DataSourceStatus
  lastCheckedAt: string | null
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

export type PipelineJobStatus = "pending" | "running" | "completed" | "failed"

export interface PipelineJob {
  id: string
  name: string
  status: PipelineJobStatus
  startedAt: string | null
  completedAt: string | null
  error: string | null
  meta: Record<string, unknown> | null
}
