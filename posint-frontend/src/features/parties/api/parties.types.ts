export interface Party {
  id: string
  name: string
  abbreviation: string
  slug: string
  color: string
  colorClass?: string
  logoUrl: string | null
  foundedYear: number | null
  ideology: string | null
  chairman: string | null
  seatsTotal: number
  senateSeats: number
  houseSeats: number
  governors: number
  description?: string
  politiciansCount?: number
  notableMembers?: Array<{ id: string; name: string }>
}

export interface PartyMember {
  id: string
  slug: string
  name: string
  position: string
  chamber: string | null
  state: string
  photoUrl: string | null
  billsSponsored: number
  attendanceRate: number
}

export interface PartyDefection {
  name: string
  fromParty: string
  toParty: string
  year: number
  reason: string
}

export interface PartyDetail extends Party {
  fullDescription?: string
  avgAttendance?: number
  totalBills?: number
  corruptionCases?: number
  politicians?: PartyMember[]
  defectionsInto?: Array<{ name: string; from: string; year: number; reason: string }>
  defectionsOut?: Array<{ name: string; to: string; year: number; reason: string }>
}

export interface SeatDistribution {
  abbreviation: string
  color: string
  seatsTotal: number
  senateSeats?: number
  houseSeats?: number
  governors?: number
  percentage: number
}
