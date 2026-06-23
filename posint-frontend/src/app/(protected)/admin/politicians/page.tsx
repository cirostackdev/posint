"use client"

import { useState, useEffect, useRef } from "react"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Pencil, Trash2, Loader2, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { usePoliticians } from "@/features/politicians/hooks/use-politicians"
import { useParties } from "@/features/parties/hooks/use-parties"
import { apiPost, apiPatch, apiDelete } from "@/shared/lib/api"
import type { Politician } from "@/features/politicians/api/politicians.types"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Badge } from "@/shared/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
]

const CHAMBERS = ["SENATE", "HOUSE_OF_REPRESENTATIVES"] as const

// ---------------------------------------------------------------------------
// Zod schema
// ---------------------------------------------------------------------------

const politicianSchema = z.object({
  name: z.string().min(1, "Name is required"),
  partyId: z.string().optional().or(z.literal("")),
  position: z.string().min(1, "Position is required"),
  chamber: z.enum(["SENATE", "HOUSE_OF_REPRESENTATIVES", ""]).optional(),
  constituency: z.string().min(1, "Constituency is required"),
  state: z.string().min(1, "State is required"),
  lga: z.string().optional().or(z.literal("")),
  photoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.enum(["Male", "Female", ""]).optional(),
  education: z.string().optional().or(z.literal("")),
  biography: z.string().optional().or(z.literal("")),
  firstElected: z
    .union([z.number().int().min(1960).max(2030), z.nan(), z.undefined()])
    .optional(),
  yearsInOffice: z.union([z.number().int().min(0), z.nan(), z.undefined()]).optional(),
  attendanceRate: z
    .union([z.number().min(0).max(100), z.nan(), z.undefined()])
    .optional(),
  sourceUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type PoliticianFormValues = z.infer<typeof politicianSchema>

// ---------------------------------------------------------------------------
// Inline AlertDialog (not in the shared UI folder)
// ---------------------------------------------------------------------------

function AlertDialog({ open, onOpenChange, children }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </AlertDialogPrimitive.Root>
  )
}

function AlertDialogContent({ children }: { children: React.ReactNode }) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <AlertDialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  )
}

function AlertDialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col space-y-2">{children}</div>
}

function AlertDialogTitle({ children }: { children: React.ReactNode }) {
  return (
    <AlertDialogPrimitive.Title className="text-lg font-semibold">
      {children}
    </AlertDialogPrimitive.Title>
  )
}

function AlertDialogDescription({ children }: { children: React.ReactNode }) {
  return (
    <AlertDialogPrimitive.Description className="text-sm text-muted-foreground">
      {children}
    </AlertDialogPrimitive.Description>
  )
}

function AlertDialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
      {children}
    </div>
  )
}

function AlertDialogCancel({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <AlertDialogPrimitive.Cancel asChild>
      <Button variant="outline" onClick={onClick}>{children}</Button>
    </AlertDialogPrimitive.Cancel>
  )
}

function AlertDialogAction({ children, onClick, disabled }: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <AlertDialogPrimitive.Action asChild>
      <Button variant="destructive" onClick={onClick} disabled={disabled}>{children}</Button>
    </AlertDialogPrimitive.Action>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

function stripEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== "" && v !== undefined && v !== "none" && !Number.isNaN(v as number),
    ),
  ) as Partial<T>
}

// ---------------------------------------------------------------------------
// PoliticianFormDialog
// ---------------------------------------------------------------------------

interface PoliticianFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: Politician | null
  onSuccess: () => void
}

function PoliticianFormDialog({ open, onOpenChange, editing, onSuccess }: PoliticianFormDialogProps) {
  const queryClient = useQueryClient()
  const { data: parties } = useParties()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PoliticianFormValues>({
    resolver: zodResolver(politicianSchema),
    defaultValues: {
      name: "",
      partyId: "",
      position: "",
      chamber: "",
      constituency: "",
      state: "",
      lga: "",
      photoUrl: "",
      dateOfBirth: "",
      gender: "",
      education: "",
      biography: "",
      firstElected: undefined,
      yearsInOffice: undefined,
      attendanceRate: undefined,
      sourceUrl: "",
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name ?? "",
        partyId: "",           // party is string abbr in list; ID not exposed — leave empty on edit
        position: editing.position ?? "",
        chamber: (editing.chamber as PoliticianFormValues["chamber"]) ?? "",
        constituency: editing.constituency ?? "",
        state: editing.state ?? "",
        lga: "",
        photoUrl: editing.photoUrl ?? "",
        dateOfBirth: "",
        gender: ((editing as any).gender as PoliticianFormValues["gender"]) ?? "",
        education: "",
        biography: "",
        firstElected: undefined,
        yearsInOffice: editing.yearsInOffice ?? undefined,
        attendanceRate: editing.attendanceRate ?? undefined,
        sourceUrl: "",
      })
    } else {
      reset({
        name: "", partyId: "", position: "", chamber: "", constituency: "",
        state: "", lga: "", photoUrl: "", dateOfBirth: "", gender: "",
        education: "", biography: "", firstElected: undefined,
        yearsInOffice: undefined, attendanceRate: undefined, sourceUrl: "",
      })
    }
  }, [editing, open, reset])

  const createMutation = useMutation({
    mutationFn: (data: Partial<PoliticianFormValues>) => apiPost<Politician>("/politicians", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["politicians"] })
      toast.success("Politician created successfully")
      onSuccess()
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to create politician")
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: Partial<PoliticianFormValues>) =>
      apiPatch<Politician>(`/politicians/${editing!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["politicians"] })
      toast.success("Politician updated successfully")
      onSuccess()
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to update politician")
    },
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function onSubmit(values: PoliticianFormValues) {
    const payload = stripEmpty(values as Record<string, unknown>) as Partial<PoliticianFormValues>
    if (editing) {
      updateMutation.mutate(payload)
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Politician" : "Add Politician"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Row 1: Name + Position */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
              <Input id="name" placeholder="Full name" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="position">Position <span className="text-destructive">*</span></Label>
              <Input id="position" placeholder="e.g. Senator" {...register("position")} />
              {errors.position && <p className="text-xs text-destructive">{errors.position.message}</p>}
            </div>
          </div>

          {/* Row 2: Party + Chamber */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Party</Label>
              <Controller
                control={control}
                name="partyId"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select party" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {(parties ?? []).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.abbreviation} — {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Chamber</Label>
              <Controller
                control={control}
                name="chamber"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select chamber" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="SENATE">Senate</SelectItem>
                      <SelectItem value="HOUSE_OF_REPRESENTATIVES">House of Representatives</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Row 3: Constituency + State */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="constituency">Constituency <span className="text-destructive">*</span></Label>
              <Input id="constituency" placeholder="Constituency" {...register("constituency")} />
              {errors.constituency && <p className="text-xs text-destructive">{errors.constituency.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>State <span className="text-destructive">*</span></Label>
              <Controller
                control={control}
                name="state"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_STATES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
            </div>
          </div>

          {/* Row 4: LGA + Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="lga">LGA</Label>
              <Input id="lga" placeholder="Local government area" {...register("lga")} />
            </div>
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Row 5: Photo URL + Source URL */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="photoUrl">Photo URL</Label>
              <Input id="photoUrl" placeholder="https://..." {...register("photoUrl")} />
              {errors.photoUrl && <p className="text-xs text-destructive">{errors.photoUrl.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sourceUrl">Source URL</Label>
              <Input id="sourceUrl" placeholder="https://..." {...register("sourceUrl")} />
              {errors.sourceUrl && <p className="text-xs text-destructive">{errors.sourceUrl.message}</p>}
            </div>
          </div>

          {/* Row 6: Date of Birth + Education */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="education">Education</Label>
              <Input id="education" placeholder="Highest qualification" {...register("education")} />
            </div>
          </div>

          {/* Row 7: First Elected + Years in Office + Attendance Rate */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstElected">First Elected</Label>
              <Input
                id="firstElected"
                type="number"
                min={1960}
                max={2030}
                placeholder="2003"
                {...register("firstElected", { valueAsNumber: true })}
              />
              {errors.firstElected && <p className="text-xs text-destructive">{errors.firstElected.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="yearsInOffice">Years in Office</Label>
              <Input
                id="yearsInOffice"
                type="number"
                min={0}
                placeholder="4"
                {...register("yearsInOffice", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="attendanceRate">Attendance Rate (%)</Label>
              <Input
                id="attendanceRate"
                type="number"
                min={0}
                max={100}
                step={0.1}
                placeholder="78.5"
                {...register("attendanceRate", { valueAsNumber: true })}
              />
              {errors.attendanceRate && <p className="text-xs text-destructive">{errors.attendanceRate.message}</p>}
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-1.5">
            <Label htmlFor="biography">Biography</Label>
            <textarea
              id="biography"
              rows={4}
              placeholder="Brief biography..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              {...register("biography")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Politician
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// DeleteConfirmDialog
// ---------------------------------------------------------------------------

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  politician: Politician | null
  onConfirm: () => void
  isPending: boolean
}

function DeleteConfirmDialog({ open, onOpenChange, politician, onConfirm, isPending }: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate Politician</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to deactivate{" "}
            <span className="font-semibold text-foreground">{politician?.name}</span>?{" "}
            This will set their account as inactive. The record will not be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deactivate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ---------------------------------------------------------------------------
// TableSkeleton
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-36" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-6 w-16" /></TableCell>
        </TableRow>
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PoliticiansAdminPage() {
  const queryClient = useQueryClient()

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Politician | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState<Politician | null>(null)

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchInput])

  const { data, isLoading } = usePoliticians({ page, limit: 20, search: search || null })
  const politicians = data?.data ?? []
  const meta = data?.meta

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/politicians/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["politicians"] })
      toast.success("Politician deactivated")
      setDeleteDialogOpen(false)
      setDeleting(null)
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to deactivate politician")
    },
  })

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(politician: Politician) {
    setEditing(politician)
    setDialogOpen(true)
  }

  function openDelete(politician: Politician) {
    setDeleting(politician)
    setDeleteDialogOpen(true)
  }

  function handleFormSuccess() {
    setDialogOpen(false)
    setEditing(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Politicians</h1>
          {meta && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {meta.total.toLocaleString()} total records
            </p>
          )}
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Politician
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-md border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/20 hover:bg-muted/20">
              <TableHead className="w-12">Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Party</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Chamber</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : politicians.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                  {search ? `No politicians matching "${search}"` : "No politicians found."}
                </TableCell>
              </TableRow>
            ) : (
              politicians.map((pol) => (
                <TableRow key={pol.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={pol.photoUrl ?? undefined} alt={pol.name} />
                      <AvatarFallback className="text-xs">{initials(pol.name)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium text-sm">{pol.name}</TableCell>
                  <TableCell>
                    {pol.party ? (
                      <Badge variant="secondary" className="text-xs">
                        {pol.party}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{pol.position}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {pol.chamber
                      ? pol.chamber === "SENATE"
                        ? "Senate"
                        : "House"
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{pol.state}</TableCell>
                  <TableCell className="text-sm">
                    {pol.attendanceRate != null ? (
                      <span className={pol.attendanceRate >= 75 ? "text-green-500" : "text-amber-500"}>
                        {pol.attendanceRate.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(pol)}
                        title="Edit politician"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => openDelete(pol)}
                        title="Deactivate politician"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
            {" "}
            <span className="text-muted-foreground/60">
              ({((meta.page - 1) * meta.limit + 1).toLocaleString()}–
              {Math.min(meta.page * meta.limit, meta.total).toLocaleString()} of {meta.total.toLocaleString()})
            </span>
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages || isLoading}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit Dialog */}
      <PoliticianFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        politician={deleting}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
