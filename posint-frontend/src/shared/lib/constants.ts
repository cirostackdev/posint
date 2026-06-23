export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi",
  "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun",
  "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
] as const

export const CHAMBERS = ["SENATE", "HOUSE_OF_REPRESENTATIVES"] as const

export const PARTY_COLORS: Record<string, string> = {
  APC: "hsl(217 91% 60%)",
  PDP: "hsl(0 72% 51%)",
  LP: "hsl(142 70% 45%)",
  NNPP: "hsl(32 95% 55%)",
  APGA: "hsl(270 60% 50%)",
  SDP: "hsl(200 80% 45%)",
}

export const BILL_STATUSES = ["FIRST_READING", "SECOND_READING", "THIRD_READING", "PASSED", "REJECTED", "WITHDRAWN"] as const
export const CASE_STATUSES = ["UNDER_INVESTIGATION", "ONGOING", "CONVICTED", "ACQUITTED", "DISMISSED", "APPEALING"] as const
export const AGENCIES = ["EFCC", "ICPC", "CCB", "NFIU"] as const
export const ELECTION_LEVELS = ["FEDERAL", "STATE", "LOCAL_GOVERNMENT", "PARTY_PRIMARY"] as const
