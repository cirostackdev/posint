"use client"

import { useState } from "react"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { apiPost, apiPatch, apiDelete } from "@/shared/lib/api"
import { useElections } from "@/features/elections/hooks/use-elections"
import { useParties } from "@/features/parties/hooks/use-parties"
import type { Election } from "@/features/elections/api/elections.types"

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
]

const LEVEL_OPTIONS = ["FEDERAL", "STATE", "LOCAL_GOVERNMENT", "PARTY_PRIMARY"] as const
type ElectionLevel = typeof LEVEL_OPTIONS[number]

function levelLabel(level: string) {
  switch (level) {
    case "FEDERAL": return "Federal"
    case "STATE": return "State"
    case "LOCAL_GOVERNMENT": return "Local Govt"
    case "PARTY_PRIMARY": return "Party Primary"
    default: return level
  }
}

function levelBadgeVariant(level: string) {
  switch (level) {
    case "FEDERAL": return "danger" as const
    case "STATE": return "warning" as const
    case "LOCAL_GOVERNMENT": return "info" as const
    case "PARTY_PRIMARY": return "secondary" as const
    default: return "secondary" as const
  }
}

interface ElectionFormData {
  year: string
  type: string
  level: ElectionLevel | ""
  state: string
  lga: string
  winnerName: string
  winnerPartyId: string
  winnerVotes: string
  totalVotes: string
  registeredVoters: string
  turnoutPct: string
  margin: string
  declaredDate: string
  sourceUrl: string
}

const EMPTY_FORM: ElectionFormData = {
  year: "",
  type: "",
  level: "",
  state: "",
  lga: "",
  winnerName: "",
  winnerPartyId: "",
  winnerVotes: "",
  totalVotes: "",
  registeredVoters: "",
  turnoutPct: "",
  margin: "",
  declaredDate: "",
  sourceUrl: "",
}

function buildPayload(form: ElectionFormData) {
  const payload: Record<string, unknown> = {
    year: Number(form.year),
    type: form.type,
    level: form.level,
    winnerName: form.winnerName,
    winnerVotes: Number(form.winnerVotes),
    totalVotes: Number(form.totalVotes),
  }
  if (form.state) payload.state = form.state
  if (form.lga) payload.lga = form.lga
  if (form.winnerPartyId) payload.winnerPartyId = form.winnerPartyId
  if (form.registeredVoters) payload.registeredVoters = Number(form.registeredVoters)
  if (form.turnoutPct) payload.turnoutPct = Number(form.turnoutPct)
  if (form.margin) payload.margin = form.margin
  if (form.declaredDate) payload.declaredDate = form.declaredDate
  if (form.sourceUrl) payload.sourceUrl = form.sourceUrl
  return payload
}

function formFromElection(e: Election): ElectionFormData {
  return {
    year: String(e.year),
    type: e.type,
    level: e.level as ElectionLevel,
    state: e.state ?? "",
    lga: e.lga ?? "",
    winnerName: e.winnerName,
    winnerPartyId: e.winnerPartyId ?? "",
    winnerVotes: String(e.winnerVotes),
    totalVotes: String(e.totalVotes),
    registeredVoters: e.registeredVoters != null ? String(e.registeredVoters) : "",
    turnoutPct: e.turnoutPct != null ? String(e.turnoutPct) : "",
    margin: e.margin ?? "",
    declaredDate: e.declaredDate ? e.declaredDate.slice(0, 10) : "",
    sourceUrl: "",
  }
}

function ElectionFormFields({
  form,
  onChange,
  parties,
}: {
  form: ElectionFormData
  onChange: (patch: Partial<ElectionFormData>) => void
  parties: Array<{ id: string; abbreviation: string }>
}) {
  return (
    <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
      <div className="space-y-1.5">
        <Label>Year *</Label>
        <Input
          type="number"
          min={1960}
          max={2030}
          value={form.year}
          onChange={(e) => onChange({ year: e.target.value })}
          placeholder="e.g. 2023"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Type *</Label>
        <Input
          value={form.type}
          onChange={(e) => onChange({ type: e.target.value })}
          placeholder="e.g. Presidential"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Level *</Label>
        <Select value={form.level} onValueChange={(v) => onChange({ level: v as ElectionLevel })}>
          <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
          <SelectContent>
            {LEVEL_OPTIONS.map((l) => (
              <SelectItem key={l} value={l}>{levelLabel(l)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>State</Label>
        <Select value={form.state || "__none"} onValueChange={(v) => onChange({ state: v === "__none" ? "" : v })}>
          <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">— None —</SelectItem>
            {NIGERIAN_STATES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>LGA</Label>
        <Input
          value={form.lga}
          onChange={(e) => onChange({ lga: e.target.value })}
          placeholder="Local Government Area"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Winner Name *</Label>
        <Input
          value={form.winnerName}
          onChange={(e) => onChange({ winnerName: e.target.value })}
          placeholder="Full name"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Winner Party</Label>
        <Select value={form.winnerPartyId || "__none"} onValueChange={(v) => onChange({ winnerPartyId: v === "__none" ? "" : v })}>
          <SelectTrigger><SelectValue placeholder="Select party" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">— None —</SelectItem>
            {parties.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.abbreviation}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Winner Votes *</Label>
        <Input
          type="number"
          min={0}
          value={form.winnerVotes}
          onChange={(e) => onChange({ winnerVotes: e.target.value })}
          placeholder="0"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Total Votes *</Label>
        <Input
          type="number"
          min={0}
          value={form.totalVotes}
          onChange={(e) => onChange({ totalVotes: e.target.value })}
          placeholder="0"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Registered Voters</Label>
        <Input
          type="number"
          min={0}
          value={form.registeredVoters}
          onChange={(e) => onChange({ registeredVoters: e.target.value })}
          placeholder="0"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Turnout %</Label>
        <Input
          type="number"
          step="0.01"
          min={0}
          max={100}
          value={form.turnoutPct}
          onChange={(e) => onChange({ turnoutPct: e.target.value })}
          placeholder="0.00"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Margin</Label>
        <Input
          value={form.margin}
          onChange={(e) => onChange({ margin: e.target.value })}
          placeholder="e.g. 3.7%"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Declared Date</Label>
        <Input
          type="date"
          value={form.declaredDate}
          onChange={(e) => onChange({ declaredDate: e.target.value })}
        />
      </div>
      <div className="col-span-2 space-y-1.5">
        <Label>Source URL</Label>
        <Input
          value={form.sourceUrl}
          onChange={(e) => onChange({ sourceUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>
    </div>
  )
}

export default function ElectionsAdminPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null)
  const [editTarget, setEditTarget] = useState<Election | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Election | null>(null)
  const [form, setForm] = useState<ElectionFormData>(EMPTY_FORM)

  const queryClient = useQueryClient()
  const { data, isLoading } = useElections({ page, search: search || null })
  const { data: parties = [] } = useParties()

  const elections = data?.data ?? []
  const totalPages = data?.meta?.totalPages ?? 1

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["elections"] })

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiPost("/elections", payload),
    onSuccess: () => { toast.success("Election created"); invalidate(); setDialogMode(null) },
    onError: (e: Error) => toast.error(e.message),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      apiPatch(`/elections/${id}`, payload),
    onSuccess: () => { toast.success("Election updated"); invalidate(); setDialogMode(null) },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/elections/${id}`),
    onSuccess: () => { toast.success("Election deleted"); invalidate(); setDeleteTarget(null) },
    onError: (e: Error) => toast.error(e.message),
  })

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditTarget(null)
    setDialogMode("create")
  }

  function openEdit(election: Election) {
    setForm(formFromElection(election))
    setEditTarget(election)
    setDialogMode("edit")
  }

  function handleSubmit() {
    const payload = buildPayload(form)
    if (!payload.year || !payload.type || !form.level || !payload.winnerName || !payload.winnerVotes || !payload.totalVotes) {
      toast.error("Please fill in all required fields")
      return
    }
    if (dialogMode === "create") {
      createMutation.mutate(payload)
    } else if (dialogMode === "edit" && editTarget) {
      editMutation.mutate({ id: editTarget.id, payload })
    }
  }

  const isPending = createMutation.isPending || editMutation.isPending

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-base font-semibold">
              Elections
              {data?.meta && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({data.meta.total.toLocaleString()} total)
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input
                className="h-8 w-48 text-xs"
                placeholder="Search..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20">
                    {["Year","Type","Level","State","Winner","Party","Votes","Actions"].map((h) => (
                      <th key={h} className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {elections.map((e) => (
                    <tr key={e.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{e.year}</td>
                      <td className="px-4 py-3 text-sm">{e.type}</td>
                      <td className="px-4 py-3">
                        <Badge variant={levelBadgeVariant(e.level)}>{levelLabel(e.level)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{e.state ?? "—"}</td>
                      <td className="px-4 py-3 text-sm font-medium">{e.winnerName}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{e.winnerParty?.abbreviation ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{e.winnerVotes.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(e)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(e)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {elections.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No elections found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogMode !== null} onOpenChange={(open) => !open && setDialogMode(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{dialogMode === "create" ? "Add Election" : "Edit Election"}</DialogTitle>
            <DialogDescription>Fields marked * are required.</DialogDescription>
          </DialogHeader>
          <ElectionFormFields form={form} onChange={(p) => setForm((f) => ({ ...f, ...p }))} parties={parties} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogMode(null)} disabled={isPending}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {dialogMode === "create" ? "Create" : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Election</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.year} {deleteTarget?.type}</span>{" "}
              election? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
