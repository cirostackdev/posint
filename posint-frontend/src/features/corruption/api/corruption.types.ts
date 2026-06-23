export interface CorruptionCase {
  id: string
  politicianName: string
  agency: "EFCC" | "ICPC" | "CCB" | "NFIU"
  caseNumber: string | null
  charges: string
  amountInvolvedKobo: string | null
  amountRecoveredKobo: string | null
  status: "UNDER_INVESTIGATION" | "ONGOING" | "CONVICTED" | "ACQUITTED" | "DISMISSED" | "APPEALING"
  court: string | null
  filingDate: string | null
  verdictDate: string | null
  sentence: string | null
  description: string
  sourceUrl: string | null
  politician?: { name: string; slug: string } | null
}

export interface CorruptionStats {
  total: number
  convictions: number
  acquittals: number
  active: number
  totalRecoveredKobo: string
}

export interface CaseListResponse {
  data: CorruptionCase[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}
