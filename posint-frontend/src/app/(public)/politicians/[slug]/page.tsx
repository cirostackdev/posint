import type { Metadata } from "next"
import { PoliticianProfilePage } from "@/features/politicians/components/PoliticianProfilePage"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
  return {
    title: `${name} — POSINT`,
    description: `Full profile of ${name}: career history, bills sponsored, asset declarations, voting record, and corruption cases on POSINT — Nigerian Political Intelligence.`,
    openGraph: {
      title: `${name} | POSINT — Nigerian Political Intelligence`,
      description: `Comprehensive political profile of ${name}.`,
    },
  }
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  return <PoliticianProfilePage slug={slug} />
}
