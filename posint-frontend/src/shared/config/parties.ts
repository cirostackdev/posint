export const PARTIES = [
  { abbreviation: "APC", name: "All Progressives Congress", color: "#2563EB", slug: "apc" },
  { abbreviation: "PDP", name: "Peoples Democratic Party", color: "#DC2626", slug: "pdp" },
  { abbreviation: "LP", name: "Labour Party", color: "#16A34A", slug: "lp" },
  { abbreviation: "NNPP", name: "New Nigeria Peoples Party", color: "#F97316", slug: "nnpp" },
  { abbreviation: "APGA", name: "All Progressives Grand Alliance", color: "#9333EA", slug: "apga" },
  { abbreviation: "SDP", name: "Social Democratic Party", color: "#0891B2", slug: "sdp" },
] as const

export type PartyAbbreviation = "APC" | "PDP" | "LP" | "NNPP" | "APGA" | "SDP" | "Independent"

export function getPartyColor(abbreviation: string): string {
  const party = PARTIES.find((p) => p.abbreviation === abbreviation)
  return party?.color ?? "#6B7280"
}
