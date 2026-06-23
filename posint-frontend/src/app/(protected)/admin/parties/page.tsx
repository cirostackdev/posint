"use client"

import { useState } from "react"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pencil, Plus, Loader2 } from "lucide-react"
import { useParties } from "@/features/parties/hooks/use-parties"
import { apiPost, apiPatch } from "@/shared/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog"
import type { Party } from "@/features/parties/api/parties.types"

interface PartyFormData {
  name: string
  abbreviation: string
  slug: string
  color: string
  foundedYear: string
  ideology: string
  chairman: string
  websiteUrl: string
}

const emptyForm: PartyFormData = {
  name: "",
  abbreviation: "",
  slug: "",
  color: "#6B7280",
  foundedYear: "",
  ideology: "",
  chairman: "",
  websiteUrl: "",
}

function partyToForm(party: Party): PartyFormData {
  return {
    name: party.name,
    abbreviation: party.abbreviation,
    slug: party.slug,
    color: party.color,
    foundedYear: party.foundedYear ? String(party.foundedYear) : "",
    ideology: party.ideology ?? "",
    chairman: party.chairman ?? "",
    websiteUrl: (party as Party & { websiteUrl?: string | null }).websiteUrl ?? "",
  }
}

function formToPayload(form: PartyFormData) {
  return {
    name: form.name,
    abbreviation: form.abbreviation,
    slug: form.slug,
    color: form.color || "#6B7280",
    ...(form.foundedYear ? { foundedYear: Number(form.foundedYear) } : {}),
    ...(form.ideology ? { ideology: form.ideology } : {}),
    ...(form.chairman ? { chairman: form.chairman } : {}),
    ...(form.websiteUrl ? { websiteUrl: form.websiteUrl } : {}),
  }
}

function PartyFormDialog({
  open,
  onOpenChange,
  party,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  party: Party | null
}) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<PartyFormData>(party ? partyToForm(party) : emptyForm)

  const isEdit = !!party

  const handleAbbreviationChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      abbreviation: value,
      slug: prev.slug === prev.abbreviation.toLowerCase() || !prev.slug
        ? value.toLowerCase()
        : prev.slug,
    }))
  }

  const createMutation = useMutation({
    mutationFn: (data: ReturnType<typeof formToPayload>) => apiPost("/parties", data),
    onSuccess: () => {
      toast.success("Party created")
      queryClient.invalidateQueries({ queryKey: ["parties"] })
      onOpenChange(false)
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to create party")
    },
  })

  const editMutation = useMutation({
    mutationFn: (data: ReturnType<typeof formToPayload>) =>
      apiPatch(`/parties/${party!.id}`, data),
    onSuccess: () => {
      toast.success("Party updated")
      queryClient.invalidateQueries({ queryKey: ["parties"] })
      onOpenChange(false)
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to update party")
    },
  })

  const isPending = createMutation.isPending || editMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.abbreviation || !form.slug) {
      toast.error("Name, abbreviation, and slug are required")
      return
    }
    const payload = formToPayload(form)
    if (isEdit) {
      editMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  const field = (
    id: keyof PartyFormData,
    label: string,
    placeholder?: string,
    type = "text"
  ) => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={form[id]}
        placeholder={placeholder}
        maxLength={id === "abbreviation" ? 10 : id === "slug" ? 50 : undefined}
        onChange={(e) => {
          if (id === "abbreviation") {
            handleAbbreviationChange(e.target.value)
          } else {
            setForm((prev) => ({ ...prev, [id]: e.target.value }))
          }
        }}
      />
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Party" : "Create Party"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {field("name", "Name *", "e.g. All Progressives Congress")}
          <div className="grid grid-cols-2 gap-4">
            {field("abbreviation", "Abbreviation *", "e.g. APC")}
            {field("slug", "Slug *", "e.g. apc")}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-3">
              <input
                id="color"
                type="color"
                value={form.color}
                onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                className="h-10 w-16 cursor-pointer rounded-md border border-input bg-background p-1"
              />
              <div
                className="h-8 w-8 rounded-full border border-border/50 shrink-0"
                style={{ backgroundColor: form.color }}
              />
              <span className="text-xs text-muted-foreground font-mono">{form.color}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {field("foundedYear", "Founded Year", "e.g. 2013", "number")}
            {field("chairman", "Chairman", "e.g. Abdullahi Ganduje")}
          </div>
          {field("ideology", "Ideology", "e.g. Progressive conservatism")}
          {field("websiteUrl", "Website URL", "https://example.com")}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Party"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function PartiesPage() {
  const { data: parties, isLoading } = useParties()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Party | null>(null)

  const openCreate = () => {
    setEditTarget(null)
    setDialogOpen(true)
  }

  const openEdit = (party: Party) => {
    setEditTarget(party)
    setDialogOpen(true)
  }

  const handleDialogChange = (v: boolean) => {
    setDialogOpen(v)
    if (!v) setEditTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Parties</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage political parties
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Party
        </Button>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            All Parties
            {parties && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({parties.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Party</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Seats</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Governors</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Chairman</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(parties ?? []).map((party) => (
                    <tr
                      key={party.id}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-5 w-5 rounded-full shrink-0 border border-border/30"
                            style={{ backgroundColor: party.color }}
                          />
                          <div>
                            <p className="text-sm font-bold text-foreground">{party.abbreviation}</p>
                            <p className="text-xs text-muted-foreground">{party.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{party.seatsTotal}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {party.governors}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {party.chairman ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(party)}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {(parties ?? []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No parties found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <PartyFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        party={editTarget}
      />
    </div>
  )
}
