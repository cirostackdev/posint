"use client"

import { Calendar, TrendingUp, MapPin, Vote, Building2, Layers } from "lucide-react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { formatCompactNumber } from "@/shared/lib/utils"
import type { Election } from "../api/elections.types"

const partyColors: Record<string, string> = {
  APC: "bg-status-info",
  PDP: "bg-status-danger",
  LP: "bg-status-success",
  NNPP: "bg-status-warning",
  APGA: "bg-purple-500",
  CPC: "bg-teal-500",
  ANPP: "bg-cyan-500",
}

const levelIcons: Record<string, typeof Vote> = {
  FEDERAL: Vote,
  STATE: Building2,
  LOCAL_GOVERNMENT: MapPin,
  PARTY_PRIMARY: Layers,
}

interface ElectionCardProps {
  election: Election
  style?: React.CSSProperties
}

export function ElectionCard({ election, style }: ElectionCardProps) {
  const LevelIcon = levelIcons[election.level] || Vote
  const partyAbbr = election.winnerParty?.abbreviation ?? election.winnerPartyId ?? ""
  const levelLabel = election.level.replace(/_/g, " ")

  return (
    <Card
      className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all animate-fade-in"
      style={style}
    >
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-shrink-0 hidden md:flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
            <LevelIcon className="h-7 w-7 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-display font-semibold text-lg text-foreground">{election.type}</h3>
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                {election.year}
              </Badge>
              <Badge variant="secondary" className="text-xs">{levelLabel}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Winner:{" "}
                <span className="font-medium text-foreground">{election.winnerName}</span>
              </span>
              {partyAbbr && (
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-3 h-3 rounded-full ${partyColors[partyAbbr] || "bg-muted"}`}
                  />
                  <span>{partyAbbr}</span>
                </div>
              )}
              {(election.state || election.lga) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {election.state}
                  {election.lga ? ` — ${election.lga}` : ""}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center md:text-right flex-shrink-0">
            <div>
              <p className="text-xl font-display font-bold text-foreground">
                {formatCompactNumber(election.winnerVotes)}
              </p>
              <p className="text-xs text-muted-foreground">Votes</p>
            </div>
            <div>
              <p className="text-xl font-display font-bold text-foreground">
                {formatCompactNumber(election.totalVotes)}
              </p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div>
              {election.margin ? (
                <>
                  <p className="text-xl font-display font-bold text-status-success">{election.margin}</p>
                  <p className="text-xs text-muted-foreground">Margin</p>
                </>
              ) : election.turnoutPct ? (
                <>
                  <p className="text-xl font-display font-bold text-foreground">
                    {Number(election.turnoutPct).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Turnout</p>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
