import type { Metadata } from "next"
import { BillDetailPage } from "@/features/legislature/components/BillDetailPage"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Bill ${id} — POSINT`,
    description: `Detailed view of Nigerian legislative bill ${id}: status, sponsors, reading dates, and voting record on POSINT — Nigerian Political Intelligence.`,
    openGraph: {
      title: `Bill ${id} | POSINT — Nigerian Political Intelligence`,
      description: `Track Nigerian bill ${id} through the National Assembly.`,
    },
  }
}

export default function Page() { return <BillDetailPage /> }
