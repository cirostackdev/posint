"use client"

import { Landmark } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { EmptyState } from "@/shared/components/shared/EmptyState"
import { formatNaira } from "@/shared/lib/utils"
import type { AssetDeclaration } from "../api/politicians.types"

interface AssetTimelineProps {
  declarations: AssetDeclaration[]
}

export function AssetTimeline({ declarations }: AssetTimelineProps) {
  if (declarations.length === 0) {
    return <EmptyState icon={Landmark} title="No asset declarations" description="No asset declarations found for this politician." />
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Estimated Value</TableHead>
          <TableHead>Year</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {declarations.map((asset) => (
          <TableRow key={asset.id}>
            <TableCell className="font-medium">{asset.category}</TableCell>
            <TableCell>{asset.description}</TableCell>
            <TableCell className="font-semibold">{formatNaira(Number(asset.estimatedValueKobo))}</TableCell>
            <TableCell>{asset.yearDeclared}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
