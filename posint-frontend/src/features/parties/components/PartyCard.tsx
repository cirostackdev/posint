"use client"

import Link from "next/link"
import { MapPin, Users, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import type { Party } from "../api/parties.types"

interface PartyCardProps {
  party: Party
  totalSeats?: number
}

export function PartyCard({ party, totalSeats = 469 }: PartyCardProps) {
  const percentage = totalSeats > 0 ? (party.seatsTotal / totalSeats) * 100 : 0

  return (
    <Link href={`/parties/${party.slug}`}>
      <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: party.color }}
              />
              <CardTitle className="text-xl">{party.abbreviation}</CardTitle>
            </div>
            <Badge variant="outline">{percentage.toFixed(1)}%</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {party.description ?? party.name}
          </p>

          <div className="space-y-3 mb-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">National Assembly Seats</span>
                <span className="font-semibold">{party.seatsTotal}</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Senate</span>
                <span className="font-semibold">{party.senateSeats}</span>
              </div>
              <Progress value={totalSeats > 0 ? (party.senateSeats / 109) * 100 : 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">House of Reps</span>
                <span className="font-semibold">{party.houseSeats}</span>
              </div>
              <Progress value={totalSeats > 0 ? (party.houseSeats / 360) * 100 : 0} className="h-2" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Governors
              </span>
              <span className="font-semibold">{party.governors}</span>
            </div>
            {party.politiciansCount !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Politicians Tracked
                </span>
                <span className="font-semibold">{party.politiciansCount}</span>
              </div>
            )}
          </div>

          {party.notableMembers && party.notableMembers.length > 0 && (
            <div className="pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Notable Members
              </p>
              <div className="flex flex-wrap gap-1">
                {party.notableMembers.slice(0, 3).map((m) => (
                  <Badge key={m.id} variant="secondary" className="text-xs">
                    {m.name.split(" ").pop()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="pt-3 flex items-center gap-1 text-sm text-primary font-medium">
            View Details <ChevronRight className="h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
