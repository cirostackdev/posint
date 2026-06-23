import type { Metadata } from "next"
import { ElectionsPage } from "@/features/elections/components/ElectionsPage"

export const metadata: Metadata = {
  title: "Election Results — POSINT",
  description: "Nigerian election results from 2007 to present: presidential, governorship, senatorial, and house of representatives elections tracked on POSINT.",
}

export default function Page() {
  return <ElectionsPage />
}
