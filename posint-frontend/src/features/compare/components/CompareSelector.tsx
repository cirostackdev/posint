"use client"

import { X, Plus, UserPlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { PartyBadge } from "@/shared/components/shared/PartyBadge"
import { getInitials } from "@/shared/lib/utils"
import type { Politician } from "@/features/politicians/api/politicians.types"

interface CompareSelectorProps {
  politicians: Politician[]
  selectedIds: string[]
  onAdd: (id: string) => void
  onRemove: (id: string) => void
}

export function CompareSelector({
  politicians,
  selectedIds,
  onAdd,
  onRemove,
}: CompareSelectorProps) {
  const available = politicians.filter((p) => !selectedIds.includes(p.id))
  const selected = selectedIds
    .map((id) => politicians.find((p) => p.id === id))
    .filter(Boolean) as Politician[]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <UserPlus className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">
            Select Politicians to Compare
          </h3>
          <Badge variant="outline" className="text-xs">
            {selectedIds.length} selected
          </Badge>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          {selected.map((pol) => (
            <div
              key={pol.id}
              className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={pol.photoUrl ?? ""} alt={pol.name} />
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {getInitials(pol.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">
                {pol.name}
              </span>
              <PartyBadge party={pol.party} size="sm" />
              <button
                onClick={() => onRemove(pol.id)}
                className="ml-1 rounded-full p-0.5 text-muted-foreground hover:text-status-danger hover:bg-status-danger/10 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {available.length > 0 && selectedIds.length < 4 && (
          <div className="flex items-center gap-2">
            <Select onValueChange={onAdd}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Add a politician..." />
              </SelectTrigger>
              <SelectContent>
                {available.map((pol) => (
                  <SelectItem key={pol.id} value={pol.id}>
                    <div className="flex items-center gap-2">
                      <span>{pol.name}</span>
                      <span className="text-muted-foreground text-xs">
                        ({pol.party})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="shrink-0" disabled>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {selectedIds.length < 2 && (
          <p className="text-sm text-muted-foreground mt-3">
            Select at least 2 politicians to start comparing.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
