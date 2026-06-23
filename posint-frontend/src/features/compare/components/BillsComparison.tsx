"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Skeleton } from "@/shared/components/ui/skeleton"
import type { Politician, SponsoredBill } from "@/features/politicians/api/politicians.types"
import { usePoliticianBills } from "@/features/politicians/hooks/use-politicians"

interface BillsComparisonProps {
  politicians: Politician[]
}

const statusColors: Record<string, string> = {
  PASSED: "bg-status-success/20 text-status-success",
  Passed: "bg-status-success/20 text-status-success",
  REJECTED: "bg-status-danger/20 text-status-danger",
  Rejected: "bg-status-danger/20 text-status-danger",
  FIRST_READING: "bg-primary/20 text-primary",
  "First Reading": "bg-primary/20 text-primary",
  SECOND_READING: "bg-accent/20 text-accent-foreground",
  "Second Reading": "bg-accent/20 text-accent-foreground",
  THIRD_READING: "bg-secondary/20 text-secondary-foreground",
  "Third Reading": "bg-secondary/20 text-secondary-foreground",
}

function BillsStats({ politician }: { politician: Politician }) {
  const { data: bills, isLoading } = usePoliticianBills(politician.slug)

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  const list = (bills ?? []) as SponsoredBill[]
  const passed = list.filter(
    (b) => b.status === "Passed" || b.status === "PASSED"
  ).length

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-medium text-foreground truncate mb-2">{politician.name}</p>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <p className="text-2xl font-bold text-foreground">{list.length}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Sponsored</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-status-success">{passed}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Passed</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BillsList({ politician }: { politician: Politician }) {
  const { data: bills, isLoading } = usePoliticianBills(politician.slug)

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{politician.name.split(" ").pop()}&apos;s Bills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  const list = (bills ?? []) as SponsoredBill[]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{politician.name.split(" ").pop()}&apos;s Bills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {list.length > 0 ? (
          list.map((bill) => (
            <div key={bill.id} className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-sm font-medium text-foreground leading-tight mb-2">{bill.title}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={statusColors[bill.status] ?? ""}>
                  {bill.status.replace(/_/g, " ")}
                </Badge>
                <span className="text-[10px] text-muted-foreground">{bill.coSponsors} co-sponsors</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No bills</p>
        )}
      </CardContent>
    </Card>
  )
}

export function BillsComparison({ politicians }: BillsComparisonProps) {
  const gridCols =
    politicians.length === 2
      ? "md:grid-cols-2"
      : politicians.length === 3
      ? "md:grid-cols-3"
      : "md:grid-cols-2 lg:grid-cols-4"

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {politicians.map((pol) => (
          <BillsStats key={pol.id} politician={pol} />
        ))}
      </div>

      {/* Side-by-side bills */}
      <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
        {politicians.map((pol) => (
          <BillsList key={pol.id} politician={pol} />
        ))}
      </div>
    </div>
  )
}
