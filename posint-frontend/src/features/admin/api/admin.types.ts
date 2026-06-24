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
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AdminUsersResponse {
  data: AdminUser[]
  meta: PaginationMeta
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
  data: AuditLogEntry[]
  meta: PaginationMeta
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
