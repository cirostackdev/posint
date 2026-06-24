"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { useAdminUsers, useUpdateUserRole } from "../hooks/use-admin"
import type { AdminUser } from "../api/admin.types"

const ROLE_OPTIONS = ["USER", "EDITOR", "ADMIN"] as const

function roleBadgeVariant(role: string) {
  switch (role) {
    case "ADMIN":
      return "danger" as const
    case "EDITOR":
      return "warning" as const
    default:
      return "secondary" as const
  }
}

function UserRow({ user }: { user: AdminUser }) {
  const { mutate: updateRole, isPending } = useUpdateUserRole()

  return (
    <tr className="border-b border-border/30 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            {user.displayName ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <Badge variant={roleBadgeVariant(user.role)}>{user.role}</Badge>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Select
            defaultValue={user.role}
            onValueChange={(value) =>
              updateRole({ userId: user.id, role: value as "USER" | "EDITOR" | "ADMIN" })
            }
            disabled={isPending}
          >
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r} value={r} className="text-xs">
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isPending && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        </div>
      </td>
    </tr>
  )
}

export function DataManagement() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAdminUsers(page, 20)

  const users = data?.data ?? []
  const totalPages = data?.meta.totalPages ?? 1

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Users
            {data && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({data.meta.total.toLocaleString()} total)
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
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">User</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Joined</th>
                    <th className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <UserRow key={user.id} user={user} />
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
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
    </div>
  )
}
