"use client"

import { useState } from "react"
import { ArrowUpDown, FileText } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { EmptyState } from "@/shared/components/shared/EmptyState"
import { formatDate } from "@/shared/lib/utils"
import type { VotingRecord } from "../api/politicians.types"

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

interface VotingRecordTableProps {
  records: VotingRecord[]
}

export function VotingRecordTable({ records }: VotingRecordTableProps) {
  const [sortAsc, setSortAsc] = useState(false)

  const sorted = [...records].sort((a, b) => {
    const diff = new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime()
    return sortAsc ? diff : -diff
  })

  if (records.length === 0) {
    return <EmptyState icon={FileText} title="No voting records" description="No voting records found for this politician." />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Bill</TableHead>
          <TableHead>
            <Button variant="ghost" size="sm" onClick={() => setSortAsc(!sortAsc)} className="h-auto p-0 text-muted-foreground hover:text-foreground">
              Date <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          </TableHead>
          <TableHead>Vote</TableHead>
          <TableHead>Bill Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((record) => (
          <TableRow key={record.id}>
            <TableCell className="font-medium max-w-xs truncate">{record.billTitle}</TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(record.sessionDate)}</TableCell>
            <TableCell>
              <Badge
                className={voteColors[record.vote] ?? "bg-muted text-muted-foreground"}
                variant="outline"
              >
                {formatStatus(record.vote)}
              </Badge>
            </TableCell>
            <TableCell>
              {record.billStatus ? (
                <Badge
                  className={statusColors[record.billStatus] ?? "bg-muted text-muted-foreground"}
                  variant="outline"
                >
                  {formatStatus(record.billStatus)}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-sm">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
