import type { Metadata } from "next"
import { PartyDetailPage } from "@/features/parties/components/PartyDetailPage"
export const metadata: Metadata = { title: "Party Detail" }
export default function Page() { return <PartyDetailPage /> }
