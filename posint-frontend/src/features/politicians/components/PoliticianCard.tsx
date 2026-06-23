"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, ArrowRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Badge } from "@/shared/components/ui/badge"
import { Card } from "@/shared/components/ui/card"
import type { Politician } from "../api/politicians.types"

interface PoliticianCardProps {
  politician: Politician
  index?: number
}

const partyVariantMap: Record<string, "apc" | "pdp" | "lp" | "nnpp" | "apga" | "default"> = {
  APC: "apc", PDP: "pdp", LP: "lp", NNPP: "nnpp", APGA: "apga",
}

export function PoliticianCard({ politician, index = 0 }: PoliticianCardProps) {
  const partyVariant = partyVariantMap[politician.party] ?? "default"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.4 }}
    >
      <Link href={`/politicians/${politician.slug}`}>
        <Card className="group overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 bg-card cursor-pointer">
          <div className="p-5">
            {/* Header: Avatar left, info right */}
            <div className="flex items-start gap-4 mb-4">
              <Avatar className="h-14 w-14 ring-2 ring-border ring-offset-2 ring-offset-background">
                <AvatarImage src={politician.photoUrl ?? ""} alt={politician.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {politician.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold text-foreground truncate">
                    {politician.name}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2 truncate">
                  {politician.position}
                </p>
                <Badge variant={partyVariant} className="text-xs">
                  {politician.party}
                </Badge>
              </div>
            </div>

            {/* Info rows */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{politician.constituency}, {politician.state}</span>
              </div>
            </div>

            {/* Stats footer */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/50">
              <div className="text-center">
                <p className="text-lg font-display font-bold text-foreground">
                  {politician.billsSponsored}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Bills</p>
              </div>
              <div className="text-center">
                <p className={`text-lg font-display font-bold ${
                  politician.attendanceRate >= 80 ? 'text-status-success' :
                  politician.attendanceRate >= 60 ? 'text-status-warning' :
                  'text-status-danger'
                }`}>
                  {politician.attendanceRate}%
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Attendance</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-display font-bold text-foreground">
                  {politician.yearsInOffice}
                </p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Years</p>
              </div>
            </div>
          </div>

          {/* Hover Action Footer */}
          <div className="px-5 py-3 bg-muted/50 border-t border-border/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="w-full text-sm font-medium text-primary hover:text-primary/80 flex items-center justify-center gap-2">
              View Full Profile
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}
