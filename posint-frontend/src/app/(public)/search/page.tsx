import type { Metadata } from "next"
import { Suspense } from "react"
import { SearchPage } from "@/features/search/components/SearchPage"

export const metadata: Metadata = {
  title: "Search — POSINT",
  description: "Search across all POSINT data: Nigerian politicians, bills, corruption cases, elections, and political parties.",
}

export default function Page() {
  return (
    <Suspense>
      <SearchPage />
    </Suspense>
  )
}
