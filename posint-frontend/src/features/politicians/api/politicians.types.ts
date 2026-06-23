export interface Politician {
  id: string
  slug: string
  name: string
  party: string
  partyColor: string
  position: string
  chamber: string | null
  constituency: string
  state: string
  photoUrl: string | null
  billsSponsored: number
  attendanceRate: number
  yearsInOffice: number
}

export interface PoliticianListMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PoliticianListResponse {
  data: Politician[]
  meta: PoliticianListMeta
}

export interface ContactInfo {
  email?: string | null
  phone?: string | null
  officeAddress?: string | null
  website?: string | null
  twitterHandle?: string | null
}

export interface VotingRecord {
  id: string
  billTitle: string
  vote: string
  sessionDate: string
  billStatus: string | null
}

export interface SponsoredBill {
  id: string
  title: string
  status: string
  chamber: string
  dateIntroduced: string
  summary?: string | null
  coSponsors: number
  readings?: BillReading[]
}

export interface BillReading {
  id: string
  readingNumber: number
  date: string
  outcome: string
}

export interface AssetDeclaration {
  id: string
  category: string
  description: string
  estimatedValueKobo: string
  yearDeclared: number
}

export interface ConstituencyProject {
  id: string
  title: string
  location: string
  budgetKobo: string
  status: string
  year: number
  completionPct: number
}

export interface PartyDefection {
  id: string
  defectionDate: string
  reason?: string | null
  fromParty?: { abbreviation: string; color: string } | null
  toParty?: { abbreviation: string; color: string } | null
}

export interface CareerEvent {
  id: string
  year: number
  title: string
  description?: string | null
  category?: string | null
}

export interface CommitteeAssignment {
  id: string
  committeeName: string
  role: string
  startDate: string
  endDate?: string | null
  chamber: string
}

export interface PoliticianDetail extends Omit<Politician, "party"> {
  biography?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  education?: string | null
  firstElected?: number | null
  party: { id: string; name: string; abbreviation: string; color: string; slug: string }
  contacts?: ContactInfo | null
  votingRecords?: VotingRecord[]
  sponsoredBills?: SponsoredBill[]
  assetDeclarations?: AssetDeclaration[]
  constituencyProjects?: ConstituencyProject[]
  defections?: PartyDefection[]
  careerEvents?: CareerEvent[]
  committees?: CommitteeAssignment[]
  socialStats?: {
    overallSentiment: number
    totalMentions: number
    followerCount: number
    engagementRate: number
  } | null
}

export interface PoliticiansStats {
  total: number
  byChamber: Array<{ chamber: string | null; _count: { _all: number } }>
  byState: Array<{ state: string; _count: { _all: number } }>
}

export interface PoliticianFilters {
  page: number
  limit: number
  sortBy: string
  sortOrder: "asc" | "desc"
  party?: string | null
  state?: string | null
  chamber?: string | null
  search?: string | null
}
