import type { Metadata } from "next"
import { PartiesPage } from "@/features/parties/components/PartiesPage"
export const metadata: Metadata = { title: "Political Parties — POSINT", description: "Nigerian political parties, their seat distribution in the National Assembly, and member profiles on POSINT — Nigerian Political Intelligence." }
export default function Page() { return <PartiesPage /> }
