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
import { useBills } from "@/features/legislature/hooks/use-legislature"
import { usePoliticians } from "@/features/politicians/hooks/use-politicians"
import type { LegislativeBill } from "@/features/legislature/api/legislature.types"

const STATUS_OPTIONS = [
  "FIRST_READING",
  "SECOND_READING",
  "THIRD_READING",
  "PASSED",
  "REJECTED",
  "WITHDRAWN",
] as const
type BillStatus = typeof STATUS_OPTIONS[number]

const CHAMBER_OPTIONS = ["SENATE", "HOUSE_OF_REPRESENTATIVES"] as const
type Chamber = typeof CHAMBER_OPTIONS[number]

function statusLabel(status: string) {
  switch (status) {
    case "FIRST_READING": return "First Reading"
    case "SECOND_READING": return "Second Reading"
    case "THIRD_READING": return "Third Reading"
    case "PASSED": return "Passed"
    case "REJECTED": return "Rejected"
    case "WITHDRAWN": return "Withdrawn"
    default: return status
  }
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case "PASSED": return "success" as const
    case "REJECTED": return "danger" as const
    case "WITHDRAWN": return "secondary" as const
    case "FIRST_READING":
    case "SECOND_READING":
    case "THIRD_READING": return "info" as const
    default: return "secondary" as const
  }
}

function chamberLabel(chamber: string) {
  return chamber === "HOUSE_OF_REPRESENTATIVES" ? "House" : "Senate"
}

interface BillFormData {
  politicianId: string
  title: string
  summary: string
  status: BillStatus | ""
  chamber: Chamber | ""
  dateIntroduced: string
  datePassed: string
  coSponsors: string
  fullTextUrl: string
  sourceUrl: string
}

const EMPTY_FORM: BillFormData = {
  politicianId: "",
  title: "",
  summary: "",
  status: "",
  chamber: "",
  dateIntroduced: "",
  datePassed: "",
  coSponsors: "",
  fullTextUrl: "",
  sourceUrl: "",
}

function buildPayload(form: BillFormData) {
  const payload: Record<string, unknown> = {
    politicianId: form.politicianId,
    title: form.title,
    status: form.status,
    chamber: form.chamber,
    dateIntroduced: form.dateIntroduced,
  }
  if (form.summary) payload.summary = form.summary
  if (form.datePassed) payload.datePassed = form.datePassed
  if (form.coSponsors) payload.coSponsors = Number(form.coSponsors)
  if (form.fullTextUrl) payload.fullTextUrl = form.fullTextUrl
  if (form.sourceUrl) payload.sourceUrl = form.sourceUrl
  return payload
}

function formFromBill(b: LegislativeBill): BillFormData {
  return {
    politicianId: b.politicianId ?? "",
    title: b.title,
    summary: b.summary ?? "",
    status: b.status as BillStatus,
    chamber: b.chamber as Chamber,
    dateIntroduced: b.dateIntroduced ? b.dateIntroduced.slice(0, 10) : "",
    datePassed: b.datePassed ? b.datePassed.slice(0, 10) : "",
    coSponsors: b.coSponsors != null ? String(b.coSponsors) : "",
    fullTextUrl: b.fullTextUrl ?? "",
    sourceUrl: "",
  }
}

function BillFormFields({
  form,
  onChange,
  politicians,
}: {
  form: BillFormData
  onChange: (patch: Partial<BillFormData>) => void
  politicians: Array<{ id: string; name: string }>
}) {
  return (
    <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1">
      <div className="col-span-2 space-y-1.5">
        <Label>Sponsor (Politician) *</Label>
        <Select value={form.politicianId || "__none"} onValueChange={(v) => onChange({ politicianId: v === "__none" ? "" : v })}>
          <SelectTrigger><SelectValue placeholder="Select politician" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">— Select —</SelectItem>
            {politicians.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2 space-y-1.5">
        <Label>Title * (max 500 chars)</Label>
        <Input
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Bill title"
          maxLength={500}
        />
      </div>
      <div className="col-span-2 space-y-1.5">
        <Label>Summary</Label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          value={form.summary}
          onChange={(e) => onChange({ summary: e.target.value })}
          placeholder="Brief summary of the bill..."
          rows={3}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Status *</Label>
        <Select value={form.status} onValueChange={(v) => onChange({ status: v as BillStatus })}>
          <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Chamber *</Label>
        <Select value={form.chamber} onValueChange={(v) => onChange({ chamber: v as Chamber })}>
          <SelectTrigger><SelectValue placeholder="Select chamber" /></SelectTrigger>
          <SelectContent>
            {CHAMBER_OPTIONS.map((c) => (
              <SelectItem key={c} value={c}>{c === "HOUSE_OF_REPRESENTATIVES" ? "House of Representatives" : "Senate"}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Date Introduced *</Label>
        <Input
          type="date"
          value={form.dateIntroduced}
          onChange={(e) => onChange({ dateIntroduced: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Date Passed</Label>
        <Input
          type="date"
          value={form.datePassed}
          onChange={(e) => onChange({ datePassed: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Co-Sponsors</Label>
        <Input
          type="number"
          min={0}
          value={form.coSponsors}
          onChange={(e) => onChange({ coSponsors: e.target.value })}
          placeholder="0"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Full Text URL</Label>
        <Input
          value={form.fullTextUrl}
          onChange={(e) => onChange({ fullTextUrl: e.target.value })}
          placeholder="https://..."
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

export default function LegislatureAdminPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | null>(null)
  const [editTarget, setEditTarget] = useState<LegislativeBill | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LegislativeBill | null>(null)
  const [form, setForm] = useState<BillFormData>(EMPTY_FORM)

  const queryClient = useQueryClient()
  const { data, isLoading } = useBills({ page, search: search || null })
  const { data: politiciansData } = usePoliticians({ limit: 200 })
  const politicians = politiciansData?.data ?? []

  const bills = data?.data ?? []
  const totalPages = data?.meta?.totalPages ?? 1

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["bills"] })

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => apiPost("/legislature/bills", payload),
    onSuccess: () => { toast.success("Bill created"); invalidate(); setDialogMode(null) },
    onError: (e: Error) => toast.error(e.message),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      apiPatch(`/legislature/bills/${id}`, payload),
    onSuccess: () => { toast.success("Bill updated"); invalidate(); setDialogMode(null) },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/legislature/bills/${id}`),
    onSuccess: () => { toast.success("Bill deleted"); invalidate(); setDeleteTarget(null) },
    onError: (e: Error) => toast.error(e.message),
  })

  function openCreate() {
    setForm(EMPTY_FORM)
    setEditTarget(null)
    setDialogMode("create")
  }

  function openEdit(bill: LegislativeBill) {
    setForm(formFromBill(bill))
    setEditTarget(bill)
    setDialogMode("edit")
  }

  function handleSubmit() {
    if (!form.politicianId || !form.title || !form.status || !form.chamber || !form.dateIntroduced) {
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
              Legislature — Bills
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
                    {["Title","Sponsor","Status","Chamber","Date Introduced","Actions"].map((h) => (
                      <th key={h} className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bills.map((b) => (
                    <tr key={b.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium max-w-xs">
                        <p className="truncate" title={b.title}>{b.title}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {b.politician?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadgeVariant(b.status)}>{statusLabel(b.status)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {chamberLabel(b.chamber)}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {b.dateIntroduced ? new Date(b.dateIntroduced).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(b)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(b)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bills.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No bills found.
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
            <DialogTitle>{dialogMode === "create" ? "Add Bill" : "Edit Bill"}</DialogTitle>
            <DialogDescription>Fields marked * are required.</DialogDescription>
          </DialogHeader>
          <BillFormFields form={form} onChange={(p) => setForm((f) => ({ ...f, ...p }))} politicians={politicians} />
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
            <DialogTitle>Delete Bill</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground line-clamp-1">{deleteTarget?.title}</span>?
              This action cannot be undone.
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
