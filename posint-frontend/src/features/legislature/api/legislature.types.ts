export interface LegislativeBill {
  id: string
  title: string
  status: "FIRST_READING" | "SECOND_READING" | "THIRD_READING" | "PASSED" | "REJECTED" | "WITHDRAWN"
  chamber: "SENATE" | "HOUSE_OF_REPRESENTATIVES"
  dateIntroduced: string
  datePassed: string | null
  coSponsors: number
  summary: string | null
  fullTextUrl: string | null
  politicianId: string | null
  politician: { name: string; slug: string } | null
  readings?: BillReading[]
}

export interface BillReading {
  id: string
  readingNumber: number
  date: string
  outcome: string
  votesFor: number | null
  votesAgainst: number | null
}

export interface LegislatureStats {
  total: number
  passed: number
  rejected: number
  pending: number
  byMonth?: Array<{ month: string; bills: number; passed: number; rejected: number }>
}

export interface BillListResponse {
  data: LegislativeBill[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}
