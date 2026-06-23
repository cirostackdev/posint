import type { Metadata } from "next"
import { ComparePage } from "@/features/compare/components/ComparePage"
export const metadata: Metadata = { title: "Compare Politicians — POSINT", description: "Compare Nigerian politicians side by side: assets, bills, voting records, corruption cases, and social sentiment on POSINT." }
export default function Page() { return <ComparePage /> }
