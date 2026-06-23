"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { useParties } from "@/features/parties/hooks/use-parties"

const partyColors: Record<string, string> = {
  APC: "bg-status-info",
  PDP: "bg-status-danger",
  LP: "bg-status-success",
  NNPP: "bg-status-warning",
  APGA: "bg-purple-500",
}

function getColorClass(abbreviation: string, color: string): string {
  if (partyColors[abbreviation]) return partyColors[abbreviation]
  return "bg-muted-foreground"
}

export function PartyBreakdown() {
  const { data: parties, isLoading } = useParties()

  const totalSeats = parties?.reduce((acc, p) => acc + p.seatsTotal, 0) ?? 0
  const totalGovernors = parties?.reduce((acc, p) => acc + p.governors, 0) ?? 0

  if (isLoading) {
    return (
      <section className="py-12 md:py-16">
        <div className="container px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </section>
    )
  }

  const partyStats = parties ?? []

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Party Representation
            </h2>
            <p className="text-muted-foreground">
              Current seat distribution in the National Assembly
            </p>
          </div>
          <Button variant="outline" className="self-start md:self-auto" asChild>
            <Link href="/parties">
              View All Parties
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Party Stats */}
          <div className="space-y-4">
            {partyStats.map((party) => {
              const percentage = totalSeats > 0 ? (party.seatsTotal / totalSeats) * 100 : 0
              const colorClass = getColorClass(party.abbreviation, party.color)
              return (
                <Link key={party.abbreviation} href={`/parties/${party.slug}`}>
                  <Card className="p-4 border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                        <span className="font-semibold text-foreground">{party.abbreviation}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-display font-bold text-foreground">{party.seatsTotal}</span>
                        <span className="text-muted-foreground text-sm ml-2">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colorClass} transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{party.governors} Governors</span>
                      <span>National Assembly Seats</span>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Right: Visual Breakdown */}
          <Card className="p-6 border-border/50">
            <h3 className="font-display text-lg font-semibold text-foreground mb-6">
              Seat Distribution Overview
            </h3>

            {/* Stacked Bar */}
            <div className="h-12 rounded-lg overflow-hidden flex mb-6">
              {partyStats.map((party) => {
                const percentage = totalSeats > 0 ? (party.seatsTotal / totalSeats) * 100 : 0
                const colorClass = getColorClass(party.abbreviation, party.color)
                return (
                  <div
                    key={party.abbreviation}
                    className={`${colorClass} transition-all duration-500 hover:opacity-80`}
                    style={{ width: `${percentage}%` }}
                    title={`${party.abbreviation}: ${party.seatsTotal} seats`}
                  />
                )
              })}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {partyStats.map((party) => (
                <div key={party.abbreviation} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${getColorClass(party.abbreviation, party.color)}`} />
                  <span className="text-sm text-muted-foreground">{party.abbreviation}</span>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{totalSeats}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Seats</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{totalGovernors}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Governors</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-foreground">{partyStats.filter(p => p.seatsTotal > 0).length}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Parties</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
