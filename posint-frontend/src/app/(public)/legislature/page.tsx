import type { Metadata } from "next"
import { LegislaturePage } from "@/features/legislature/components/LegislaturePage"

export const metadata: Metadata = {
  title: "Legislative Activity — POSINT",
  description: "Track bills and legislation through the Nigerian National Assembly. Monitor bill status, sponsors, readings, and voting records on POSINT.",
}

export default function Page() { return <LegislaturePage /> }
