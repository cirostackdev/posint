"use client"

import dynamic from "next/dynamic"
import { Building } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { PageShell } from "@/shared/components/layout/PageShell"
import { PartyCard } from "./PartyCard"
import { useParties, useSeatDistribution } from "../hooks/use-parties"

const PartySeatsChart = dynamic(
  () => import("./PartySeatsChart").then((m) => ({ default: m.PartySeatsChart })),
  { ssr: false, loading: () => <Skeleton className="h-[350px] w-full rounded-lg" /> }
)

const ChamberBarChart = dynamic(
  () => import("./PartySeatsChart").then((m) => ({ default: m.ChamberBarChart })),
  { ssr: false, loading: () => <Skeleton className="h-[350px] w-full rounded-lg" /> }
)

export function PartiesPage() {
  const { data: parties, isLoading } = useParties()
  const { data: distribution = [] } = useSeatDistribution()

  const totalSeats = (parties ?? []).reduce((acc, p) => acc + p.seatsTotal, 0)
  const totalGovernors = (parties ?? []).reduce((acc, p) => acc + p.governors, 0)
  const majorParties = (parties ?? []).length
  const majorityParty = (parties ?? []).reduce(
    (best, p) => (p.seatsTotal > best.seats ? { abbr: p.abbreviation, seats: p.seatsTotal } : best),
    { abbr: "—", seats: 0 }
  )

  return (
    <PageShell
      hero={{
        icon: Building,
        iconClassName: "bg-primary/10 text-primary",
        title: "Party Representation",
        description:
          "Detailed breakdown of political party representation across Nigerian legislative bodies and state governments.",
      }}
    >
      <div className="py-8 space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-display font-bold text-foreground">{totalSeats}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Seats</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-display font-bold text-foreground">{totalGovernors}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">State Governors</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-display font-bold text-foreground">{majorParties}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Major Parties</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-display font-bold text-status-info">{majorityParty.abbr}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Majority Party</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts — seat distribution + chamber bar */}
        {distribution.length > 0 && (
          <div className="grid lg:grid-cols-2 gap-6">
            <PartySeatsChart data={distribution} title="Seat Distribution" dataKey="seatsTotal" />
            <ChamberBarChart data={distribution} />
          </div>
        )}

        {/* Governor Distribution */}
        {distribution.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>State Governorships by Party</CardTitle>
            </CardHeader>
            <CardContent>
              <PartySeatsChart data={distribution} title="" dataKey="governors" />
            </CardContent>
          </Card>
        )}

        {/* Party Breakdown */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-6">Party Breakdown</h2>
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(parties ?? []).map((party) => (
                <PartyCard key={party.id} party={party} totalSeats={totalSeats} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
