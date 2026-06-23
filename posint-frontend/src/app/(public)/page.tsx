import type { Metadata } from "next"
import { HomePage } from "@/features/home/components/HomePage"

export const metadata: Metadata = {
  title: "POSINT — Nigerian Political Intelligence",
  description: "Open-source intelligence on Nigerian politicians, elections, legislation, and anti-corruption efforts.",
}

export default function Page() {
  return <HomePage />
}
