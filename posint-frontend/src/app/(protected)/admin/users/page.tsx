"use client"

import { useState } from "react"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { Trash2, Loader2, Search } from "lucide-react"
import { useAdminUsers } from "@/features/admin/hooks/use-admin"
import { apiPatch, apiDelete } from "@/shared/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/components/ui/dialog"
import type { AdminUser } from "@/features/admin/api/admin.types"

type Role = "USER" | "EDITOR" | "ADMIN"

function roleBadgeVariant(role: Role) {
  switch (role) {
    case "ADMIN":
      return "danger" as const
    case "EDITOR":
      return "info" as const
    default:
      return "secondary" as const
  }
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return "Never"
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function UserRow({
  user,
  onDeactivate,
}: {
  user: AdminUser
  onDeactivate: (user: AdminUser) => void
}) {
  const queryClient = useQueryClient()

  const roleMutation = useMutation({
    mutationFn: (role: Role) => apiPatch(`/admin/users/${user.id}/role`, { role }),
    onSuccess: () => {
      toast.success("Role updated")
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to update role")
    },
  })

  const isActive = user.isActive !== false

  return (
    <tr className="border-b border-border/30 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">{user.email}</p>
          {user.displayName && (
            <p className="text-xs text-muted-foreground">{user.displayName}</p>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={roleBadgeVariant(user.role)}>{user.role}</Badge>
      </td>
      <td className="px-4 py-3">
        <Badge variant={isActive ? "success" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {relativeTime(user.lastLoginAt ?? null)}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Select
            defaultValue={user.role}
            onValueChange={(value) => roleMutation.mutate(value as Role)}
            disabled={roleMutation.isPending}
          >
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USER" className="text-xs">USER</SelectItem>
              <SelectItem value="EDITOR" className="text-xs">EDITOR</SelectItem>
              <SelectItem value="ADMIN" className="text-xs">ADMIN</SelectItem>
            </SelectContent>
          </Select>
          {roleMutation.isPending && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => onDeactivate(user)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Deactivate</span>
          </Button>
        </div>
      </td>
    </tr>
  )
}

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [confirmUser, setConfirmUser] = useState<AdminUser | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useAdminUsers(page, 20)

  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => apiDelete(`/admin/users/${userId}`),
    onSuccess: () => {
      toast.success("User deactivated")
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      setConfirmUser(null)
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Failed to deactivate user")
    },
  })

  const handleSearchChange = (value: string) => {
    setSearch(value)
    clearTimeout((handleSearchChange as { _t?: ReturnType<typeof setTimeout> })._t)
    ;(handleSearchChange as { _t?: ReturnType<typeof setTimeout> })._t = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 400)
  }

  const users = (data?.data ?? []).filter((u) => {
    if (!debouncedSearch) return true
    const q = debouncedSearch.toLowerCase()
    return u.email.toLowerCase().includes(q) || (u.displayName ?? "").toLowerCase().includes(q)
  })

  const totalPages = data?.meta.totalPages ?? 1

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage user accounts and roles
        </p>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="text-base font-semibold">
              All Users
              {data && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({data.meta.total.toLocaleString()} total)
                </span>
              )}
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                className="pl-8 h-8 text-sm"
                placeholder="Search by email or name…"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
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
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Login</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <UserRow key={user.id} user={user} onDeactivate={setConfirmUser} />
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deactivate confirmation dialog */}
      <Dialog open={!!confirmUser} onOpenChange={(v) => { if (!v) setConfirmUser(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>
              This will deactivate{" "}
              <span className="font-medium text-foreground">{confirmUser?.email}</span>. They will
              no longer be able to log in. This action can be reversed by an admin.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmUser(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deactivateMutation.isPending}
              onClick={() => confirmUser && deactivateMutation.mutate(confirmUser.id)}
            >
              {deactivateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
