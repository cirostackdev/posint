import type { Metadata } from "next"
import { AntiCorruptionPage } from "@/features/corruption/components/AntiCorruptionPage"
export const metadata: Metadata = { title: "Anti-Corruption Tracker — POSINT", description: "Monitor EFCC and ICPC corruption cases involving Nigerian politicians and public officials on POSINT — Nigerian Political Intelligence." }
export default function Page() { return <AntiCorruptionPage /> }
