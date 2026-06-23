"use client"

import { FileText } from "lucide-react"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { EmptyState } from "@/shared/components/shared/EmptyState"
import { formatDate } from "@/shared/lib/utils"
import type { SponsoredBill } from "../api/politicians.types"

const statusColors: Record<string, string> = {
  PASSED: "bg-status-success/20 text-status-success",
  Passed: "bg-status-success/20 text-status-success",
  REJECTED: "bg-status-danger/20 text-status-danger",
  Rejected: "bg-status-danger/20 text-status-danger",
  PENDING: "bg-status-warning/20 text-status-warning",
  Pending: "bg-status-warning/20 text-status-warning",
  FIRST_READING: "bg-primary/20 text-primary",
  "First Reading": "bg-primary/20 text-primary",
  SECOND_READING: "bg-accent/20 text-accent-foreground",
  "Second Reading": "bg-accent/20 text-accent-foreground",
  THIRD_READING: "bg-secondary/20 text-secondary-foreground",
  "Third Reading": "bg-secondary/20 text-secondary-foreground",
  WITHDRAWN: "bg-muted text-muted-foreground",
  Withdrawn: "bg-muted text-muted-foreground",
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

interface BillsListProps {
  bills: SponsoredBill[]
}

export function BillsList({ bills }: BillsListProps) {
  if (bills.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No sponsored bills found for this politician.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {bills.map((bill) => (
        <Card key={bill.id}>
          <CardHeader>
            <div className="flex flex-wrap justify-between items-start gap-2">
              <CardTitle className="text-lg">{bill.title}</CardTitle>
              <Badge
                className={statusColors[bill.status] ?? "bg-muted text-muted-foreground"}
                variant="outline"
              >
                {formatStatus(bill.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {bill.summary && (
              <p className="text-sm text-muted-foreground mb-3">{bill.summary}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-muted-foreground">
                Introduced: {formatDate(bill.dateIntroduced)}
              </span>
              <span className="text-muted-foreground">{bill.coSponsors} co-sponsors</span>
              {bill.chamber && (
                <span className="text-muted-foreground capitalize">
                  {bill.chamber.toLowerCase().replace(/_/g, " ")}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
