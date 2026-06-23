import Link from "next/link"
import { Gavel, Shield, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { formatNaira } from "@/shared/lib/utils"
import type { CorruptionCase } from "../api/corruption.types"

const statusConfig: Record<string, { variant: "default" | "info" | "warning" | "success" | "danger" }> = {
  ONGOING: { variant: "warning" },
  CONVICTED: { variant: "danger" },
  ACQUITTED: { variant: "success" },
  UNDER_INVESTIGATION: { variant: "info" },
  DISMISSED: { variant: "default" },
  APPEALING: { variant: "warning" },
}

interface CaseCardProps {
  case_: CorruptionCase
  style?: React.CSSProperties
}

export function CaseCard({ case_, style }: CaseCardProps) {
  const statusVariant = statusConfig[case_.status]?.variant ?? "default"
  const displayStatus = case_.status.replace(/_/g, " ")
  const year = case_.filingDate ? new Date(case_.filingDate).getFullYear() : null

  return (
    <Link href={`/anti-corruption/${case_.id}`}>
      <Card
        className="overflow-hidden border-border/50 hover:shadow-lg hover:border-primary/30 transition-all animate-scale-in cursor-pointer h-full"
        style={style}
      >
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                {case_.politicianName}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  {case_.agency}
                </Badge>
                {year && <span className="text-sm text-muted-foreground">{year}</span>}
              </div>
            </div>
            <Badge variant={statusVariant}>{displayStatus}</Badge>
          </div>

          {/* Amount */}
          {case_.amountInvolvedKobo && Number(case_.amountInvolvedKobo) > 0 && (
            <div className="p-3 rounded-lg bg-status-danger/5 border border-status-danger/20 mb-4">
              <p className="text-sm text-muted-foreground mb-1">Amount Involved</p>
              <p className="text-xl font-display font-bold text-status-danger">
                {formatNaira(Number(case_.amountInvolvedKobo))}
              </p>
            </div>
          )}

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">{case_.description}</p>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gavel className="h-4 w-4" />
              <span>Case Details</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
