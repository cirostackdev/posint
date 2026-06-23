export interface Election {
  id: string
  year: number
  type: string
  level: "FEDERAL" | "STATE" | "LOCAL_GOVERNMENT" | "PARTY_PRIMARY"
  state: string | null
  lga: string | null
  winnerName: string
  winnerVotes: number
  totalVotes: number
  registeredVoters: number | null
  turnoutPct: number | null
  margin: string | null
  declaredDate: string | null
  winnerPartyId: string | null
  winnerParty: { abbreviation: string; color: string } | null
  candidates?: ElectionCandidate[]
}

export interface ElectionCandidate {
  id: string
  candidateName: string
  votes: number
  position: number
  party?: { abbreviation: string; color: string } | null
}

export interface ElectionsStats {
  total: number
  byLevel: Array<{ level: string; _count: { _all: number } }>
  byYear: Array<{ year: number; _count: { _all: number } }>
}

export interface ElectionListResponse {
  data: Election[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}
