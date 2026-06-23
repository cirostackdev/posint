import type { Metadata } from "next"
import { PoliticiansPage } from "@/features/politicians/components/PoliticiansPage"

export const metadata: Metadata = {
  title: "Politicians Database — POSINT",
  description: "Browse comprehensive profiles of Nigerian elected officials: senators, representatives, governors, and ministers with career history, assets, and voting records.",
}

export default function Page() {
  return <PoliticiansPage />
}
