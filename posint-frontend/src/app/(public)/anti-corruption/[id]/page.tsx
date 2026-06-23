import type { Metadata } from "next"
import { CaseDetailPage } from "@/features/corruption/components/CaseDetailPage"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Corruption Case ${id} — POSINT`,
    description: `Details of Nigerian corruption case ${id} from EFCC or ICPC records on POSINT — Nigerian Political Intelligence.`,
    openGraph: {
      title: `Case ${id} | POSINT — Nigerian Political Intelligence`,
      description: `Full details of corruption case ${id} on POSINT.`,
    },
  }
}

export default function Page() { return <CaseDetailPage /> }
