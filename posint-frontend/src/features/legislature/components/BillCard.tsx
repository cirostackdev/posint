"use client"

import Link from "next/link"
import { FileText, Clock, CheckCircle2, XCircle, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { formatDate } from "@/shared/lib/utils"
import type { LegislativeBill } from "../api/legislature.types"

interface BillCardProps {
  bill: LegislativeBill
  style?: React.CSSProperties
}

const statusConfig: Record<string, { variant: "default" | "info" | "warning" | "success" | "danger"; icon: typeof Clock }> = {
  FIRST_READING: { variant: "info", icon: Clock },
  SECOND_READING: { variant: "warning", icon: Clock },
  THIRD_READING: { variant: "warning", icon: Clock },
  PASSED: { variant: "success", icon: CheckCircle2 },
  REJECTED: { variant: "danger", icon: XCircle },
  WITHDRAWN: { variant: "default", icon: XCircle },
}

export function BillCard({ bill, style }: BillCardProps) {
  const status = statusConfig[bill.status]
  const StatusIcon = status?.icon || Clock

  return (
    <Link href={`/legislature/${bill.id}`}>
      <Card
        className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all animate-fade-in cursor-pointer"
        style={style}
      >
        <CardContent className="p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-shrink-0 hidden md:flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">
                  {bill.title}
                </h3>
                <Badge variant={status?.variant || "default"} className="self-start sm:self-auto">
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {bill.status.replace(/_/g, " ")}
                </Badge>
              </div>
              {bill.politician && (
                <p className="text-sm text-muted-foreground">
                  Sponsored by{" "}
                  <span className="font-medium text-foreground">{bill.politician.name}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Badge variant="outline" className="font-normal">
                {bill.chamber.replace(/_/g, " ")}
              </Badge>
              <span className="hidden sm:inline">{formatDate(bill.dateIntroduced)}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
