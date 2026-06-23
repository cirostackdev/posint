"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Shield,
  BarChart3,
  Users,
  Database,
  GitBranch,
  Menu,
  LogOut,
  Vote,
  BookOpen,
  AlertTriangle,
  Building2,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Sheet, SheetContent } from "@/shared/components/ui/sheet"
import { cn } from "@/shared/lib/utils"
import { useAuthStore } from "@/shared/stores/useAuthStore"
import { apiPost } from "@/shared/lib/api"
import { toast } from "sonner"

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Politicians", href: "/admin/politicians", icon: Users },
  { label: "Elections", href: "/admin/elections", icon: Vote },
  { label: "Legislature", href: "/admin/legislature", icon: BookOpen },
  { label: "Corruption Cases", href: "/admin/corruption", icon: AlertTriangle },
  { label: "Parties", href: "/admin/parties", icon: Building2 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Pipeline", href: "/admin/pipeline", icon: GitBranch },
  { label: "Data Sources", href: "/admin/data", icon: Database },
  { label: "Audit Log", href: "/admin/audit", icon: ClipboardList },
]

interface DashboardShellProps {
  children: React.ReactNode
  title: string
}

export function DashboardShell({ children, title }: DashboardShellProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  async function handleSignOut() {
    try {
      await apiPost("/auth/logout", {})
    } catch {
      // ignore — clear auth regardless
    }
    clearAuth()
    toast.success("Signed out")
    router.push("/")
  }

  function isActive(item: (typeof ADMIN_NAV)[number]) {
    if (item.exact) return pathname === item.href
    return pathname === item.href || pathname.startsWith(item.href + "/")
  }

  const NavItems = () => (
    <nav className="flex flex-col gap-0.5 p-3 flex-1">
      {ADMIN_NAV.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          asChild
          onClick={() => setOpen(false)}
          className={cn(
            "justify-start text-sm h-9",
            isActive(item)
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Link href={item.href}>
            <item.icon className="mr-2 h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        </Button>
      ))}
    </nav>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-border/50 bg-card">
        <div className="flex h-16 items-center gap-2 px-4 border-b border-border/50 shrink-0">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-display font-bold text-foreground">POSINT Admin</span>
        </div>
        <NavItems />
        {/* Sidebar footer */}
        <div className="p-3 border-t border-border/50 shrink-0">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
              {(user?.displayName ?? user?.email ?? "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {user?.displayName ?? user?.email ?? "Admin"}
              </p>
              {user?.displayName && (
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-muted-foreground hover:text-destructive mt-1"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-60 p-0 flex flex-col">
          <div className="flex h-16 items-center gap-2 px-4 border-b border-border/50 shrink-0">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-foreground">POSINT Admin</span>
          </div>
          <NavItems />
          <div className="p-3 border-t border-border/50 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full justify-start text-muted-foreground hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between px-4 border-b border-border/50 bg-card shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-display font-semibold text-foreground">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sign out"
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
