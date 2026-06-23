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
import { useCases } from "@/features/corruption/hooks/use-corruption"
import { usePoliticians } from "@/features/politicians/hooks/use-politicians"
import type { CorruptionCase } from "@/features/corruption/api/corruption.types"

const AGENCY_OPTIONS = ["EFCC", "ICPC", "CCB", "NFIU"] as const
type Agency = typeof AGENCY_OPTIONS[number]

const STATUS_OPTIONS = [
  "UNDER_INVESTIGATION",
  "ONGOING",
  "CONVICTED",
  "ACQUITTED",
  "DISMISSED",
  "APPEALING",
] as const
type CaseStatus = typeof STATUS_OPTIONS[number]

function statusLabel(status: string) {
  switch (status) {
    case "UNDER_INVESTIGATION": return "Under Investigation"
    case "ONGOING": return "Ongoing"
    case "CONVICTED": return "Convicted"
    case "ACQUITTED": return "Acquitted"
    case "DISMISSED": return "Dismissed"
    case "APPEALING": return "Appealing"
    default: return status
  }
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case "CONVICTED": return "danger" as const
    case "ACQUITTED": return "success" as const
    case "UNDER_INVESTIGATION": return "info" as const
    case "ONGOING": return "warning" as const
    case "DISMISSED": return "secondary" as const
    case "APPEALING": return "gold" as const
    default: return "secondary" as const
  }
}

function formatKobo(kobo: number | string | null | undefined): string {
  if (kobo == null || kobo === "") return "—"
  const num = typeof kobo === "string" ? parseFloat(kobo) : kobo
  if (isNaN(num)) return "—"
  return "₦" + (num / 100).toLocaleString()
}

interface CaseFormData {
  politicianId: string
  politicianName: string
  agency: Agency | ""
  caseNumber: string
  charges: string
  amountInvolvedKobo: string
  status: CaseStatus | ""
  court: string
  filingDate: string
  verdictDate: string
  sentence: string
  description: string
  sourceUrl: string
}

const EMPTY_FORM: CaseFormData = {
  politicianId: "",
  politicianName: "",
  agency: "",
  caseNumber: "",
  charges: "",
  amountInvolvedKobo: "",
  status: "",
  court: "",
  filingDate: "",
  verdictDate: "",
  sentence: "",
  description: "",
  sourceUrl: "",
}

function buildPayload(form: CaseFormData) {
  const payload: Record<string, unknown> = {
    politicianName: form.politicianName,
    agency: form.agency,
    charges: form.charges,
    status: form.status,
    description: form.description,
  }
  if (form.politicianId) payload.politicianId = form.politicianId
  if (form.caseNumber) payload.caseNumber = form.caseNumber
  if (form.amountInvolvedKobo) payload.amountInvolvedKobo = Number(form.amountInvolvedKobo)
  if (form.court) payload.court = form.court
  if (form.filingDate) payload.filingDate = form.filingDate
  if (form.verdictDate) payload.verdictDate = form.verdictDate
  if (form.sentence) payload.sentence = form.sentence
  if (form.sourceUrl) payload.sourceUrl = form.sourceUrl
  return payload
}

function formFromCase(c: CorruptionCase): CaseFormData {
  return {
    politicianId: c.politician ? "" : "",
    politicianName: c.politicianName,
    agency: c.agency as Agency,
    caseNumber: c.caseNumber ?? "",
    charges: c.charges,
    amountInvolvedKobo: c.amountInvolvedKobo != null ? String(c.amountInvolvedKobo) : "",
    status: c.status as CaseStatus,
    court: c.court ?? "",
    filingDate: c.filingDate ? c.filingDate.slice(0, 10) : "",
    verdictDate: c.verdictDate ? c.verdictDate.slice(0, 10) : "",
    sentence: c.sentence ?? "",
    description: c.description,
    sourceUrl: "",
  }
}

function CaseFormFields({
  form,
  onChange,
  politicians,
}: {
  form: CaseFormData
  onChange: (patch: Partial<CaseFormData>) => void
  politicians: Array<{ id: string; name: string }>
}) {
  return (
    <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
      <div className="space-y-1.5">
        <Label>Politician Name *</Label>
        <Input
          value={form.politicianName}
          onChange={(e) => onChange({ politicianName: e.target.value })}
          placeholder="Full name"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Link to Politician (optional)</Label>
        <Select
          value={form.politicianId || "__none"}
          onValueChange={(v) => {
            const id = v === "__none" ? "" : v
            const politician = politicians.find((p) => p.id === id)
            onChange({ politicianId: id, ...(politician ? { politicianName: politician.name } : {}) })
          }}
        >
          <SelectTrigger><SelectValue placeholder="Select politician" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">— None —</SelectItem>
            {politicians.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Agency *</Label>
        <Select value={form.agency} onValueChange={(v) => onChange({ agency: v as Agency })}>
          <SelectTrigger><SelectValue placeholder="Select agency" /></SelectTrigger>
          <SelectContent>
            {AGENCY_OPTIONS.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Status *</Label>
        <Select value={form.status} onValueChange={(v) => onChange({ status: v as CaseStatus })}>
          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Case Number</Label>
        <Input
          value={form.caseNumber}
          onChange={(e) => onChange({ caseNumber: e.target.value })}
          placeholder="e.g. FHC/ABJ/123/2023"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Court</Label>
        <Input
          value={form.court}
          onChange={(e) => onChange({ court: e.target.value })}
          placeholder="e.g. Federal High Court Abuja"
        />
      </div>
      <div className="col-span-2 space-y-1.5">
        <Label>Charges *</Label>
        <Input
          value={form.charges}
          onChange={(e) => onChange({ charges: e.target.value })}
          placeholder="e.g. Money laundering, abuse of office"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Amount Involved (in kobo)</Label>
        <Input
          type="number"
          min={0}
          value={form.amountInvolvedKobo}
          onChange={(e) => onChange({ amountInvolvedKobo: e.target.value })}
          placeholder="e.g. 100000000 = ₦1,000,000"
        />
        {form.amountInvolvedKobo && (
          <p className="text-xs text-muted-foreground">{formatKobo(form.amountInvolvedKobo)}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label>Sentence</Label>
        <Input
          value={form.sentence}
          onChange={(e) => onChange({ sentence: e.target.value })}
          placeholder="e.g. 10 years imprisonment"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Filing Date</Label>
        <Input
          type="date"
          value={form.filingDate}
          onChange={(e) => onChange({ filingDate: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Verdict Date</Label>
        <Input
          type="date"
          value={form.verdictDate}
          onChange={(e) => onChange({ verdictDate: e.target.value })}
        />
      </div>
      <div className="col-span-2 space-y-1.5">
        <Label>Description *</Label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Detailed description of the case..."
          rows={3}
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

export default function CorruptionAdminPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null)
  const [editTarget, setEditTarget] = useState<CorruptionCase | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CorruptionCase | null>(null)
  const [form, setForm] = useState<CaseFormData>(EMPTY_FORM)

  const queryClient = useQueryClient()
  const { data, isLoading } = useCases({ page, search: search || null })
  const { data: politiciansData } = usePoliticians({ limit: 200 })
  const politicians = politiciansData?.data ?? []

  const cases = data?.data ?? []
  const totalPages = data?.meta?.totalPages ?? 1

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cases"] })

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiPost("/corruption/cases", payload),
    onSuccess: () => { toast.success("Case created"); invalidate(); setDialogMode(null) },
    onError: (e: Error) => toast.error(e.message),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      apiPatch(`/corruption/cases/${id}`, payload),
    onSuccess: () => { toast.success("Case updated"); invalidate(); setDialogMode(null) },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/corruption/cases/${id}`),
    onSuccess: () => { toast.success("Case marked as inactive"); invalidate(); setDeleteTarget(null) },
    onError: (e: Error) => toast.error(e.message),
  })

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditTarget(null)
    setDialogMode("create")
  }

  function openEdit(corruptionCase: CorruptionCase) {
    setForm(formFromCase(corruptionCase))
    setEditTarget(corruptionCase)
    setDialogMode("edit")
  }

  function handleSubmit() {
    if (!form.politicianName || !form.agency || !form.charges || !form.status || !form.description) {
      toast.error("Please fill in all required fields")
      return
    }
    const payload = buildPayload(form)
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
              Corruption Cases
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
                    {["Politician","Agency","Status","Amount","Filing Date","Actions"].map((h) => (
                      <th key={h} className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{c.politicianName}</p>
                        {c.caseNumber && (
                          <p className="text-xs text-muted-foreground">{c.caseNumber}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">{c.agency}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadgeVariant(c.status)}>{statusLabel(c.status)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {formatKobo(c.amountInvolvedKobo)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {c.filingDate ? new Date(c.filingDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(c)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {cases.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No corruption cases found.
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
            <DialogTitle>{dialogMode === "create" ? "Add Corruption Case" : "Edit Corruption Case"}</DialogTitle>
            <DialogDescription>Fields marked * are required.</DialogDescription>
          </DialogHeader>
          <CaseFormFields form={form} onChange={(p) => setForm((f) => ({ ...f, ...p }))} politicians={politicians} />
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
            <DialogTitle>Deactivate Case</DialogTitle>
            <DialogDescription>
              This will mark the case against{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.politicianName}</span>{" "}
              as inactive. The record will be soft-deleted and removed from public view.
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
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
