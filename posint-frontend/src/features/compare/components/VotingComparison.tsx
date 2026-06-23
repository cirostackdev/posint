"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { Skeleton } from "@/shared/components/ui/skeleton"
import type { Politician, VotingRecord } from "@/features/politicians/api/politicians.types"
import { usePoliticianVotingRecords } from "@/features/politicians/hooks/use-politicians"

interface VotingComparisonProps {
  politicians: Politician[]
}

const voteColors: Record<string, string> = {
  YES: "bg-status-success/20 text-status-success",
  Yes: "bg-status-success/20 text-status-success",
  NO: "bg-status-danger/20 text-status-danger",
  No: "bg-status-danger/20 text-status-danger",
  ABSTAIN: "bg-status-warning/20 text-status-warning",
  Abstain: "bg-status-warning/20 text-status-warning",
  ABSENT: "bg-muted text-muted-foreground",
  Absent: "bg-muted text-muted-foreground",
}

function PoliticianVotingStats({ politician }: { politician: Politician }) {
  const { data: records, isLoading } = usePoliticianVotingRecords(politician.slug)

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

  const list = records ?? []
  const yes = list.filter((r) => r.vote === "Yes" || r.vote === "YES").length
  const no = list.filter((r) => r.vote === "No" || r.vote === "NO").length
  const abstain = list.filter((r) => r.vote === "Abstain" || r.vote === "ABSTAIN").length

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm font-medium text-foreground truncate mb-2">{politician.name}</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-status-success">{yes}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Yes</p>
          </div>
          <div>
            <p className="text-lg font-bold text-status-danger">{no}</p>
            <p className="text-[10px] text-muted-foreground uppercase">No</p>
          </div>
          <div>
            <p className="text-lg font-bold text-status-warning">{abstain}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Abstain</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function VotingTableInner({ politicians }: { politicians: Politician[] }) {
  const p0 = usePoliticianVotingRecords(politicians[0]?.slug ?? "")
  const p1 = usePoliticianVotingRecords(politicians[1]?.slug ?? "")
  const p2 = usePoliticianVotingRecords(politicians[2]?.slug ?? "")
  const p3 = usePoliticianVotingRecords(politicians[3]?.slug ?? "")

  const recordsQueries = [
    { politician: politicians[0], records: (p0.data ?? []) as VotingRecord[], isLoading: p0.isLoading },
    { politician: politicians[1], records: (p1.data ?? []) as VotingRecord[], isLoading: p1.isLoading },
    { politician: politicians[2], records: (p2.data ?? []) as VotingRecord[], isLoading: p2.isLoading },
    { politician: politicians[3], records: (p3.data ?? []) as VotingRecord[], isLoading: p3.isLoading },
  ].filter((q) => q.politician)

  const isLoading = recordsQueries.some((q) => q.isLoading)

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  // Gather all unique bills
  const allBills = new Map<string, { title: string; date: string }>()
  recordsQueries.forEach((q) => {
    q.records.forEach((vr) => {
      if (!allBills.has(vr.billTitle)) {
        allBills.set(vr.billTitle, { title: vr.billTitle, date: vr.sessionDate })
      }
    })
  })

  const bills = Array.from(allBills.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (bills.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No voting records available for the selected politicians.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[200px]">Bill</TableHead>
          {recordsQueries.map((q) => (
            <TableHead key={q.politician!.id} className="text-center min-w-[100px]">
              {q.politician!.name.split(" ").pop()}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {bills.map((bill) => (
          <TableRow key={bill.title}>
            <TableCell className="font-medium text-sm">{bill.title}</TableCell>
            {recordsQueries.map((q) => {
              const record = q.records.find((vr) => vr.billTitle === bill.title)
              return (
                <TableCell key={q.politician!.id} className="text-center">
                  {record ? (
                    <Badge variant="outline" className={voteColors[record.vote] ?? ""}>
                      {record.vote}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function VotingTable({ politicians }: { politicians: Politician[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Voting Records by Bill</CardTitle>
      </CardHeader>
      <CardContent>
        <VotingTableInner politicians={politicians} />
      </CardContent>
    </Card>
  )
}

export function VotingComparison({ politicians }: VotingComparisonProps) {
  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {politicians.map((pol) => (
          <PoliticianVotingStats key={pol.id} politician={pol} />
        ))}
      </div>

      {/* Side-by-side voting table */}
      <VotingTable politicians={politicians} />
    </div>
  )
}
