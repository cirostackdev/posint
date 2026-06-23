"use client"

import Link from "next/link"
import { User, Shield, BarChart3, Vote, FileText, AlertTriangle, Users, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { useAuthStore } from "@/shared/stores/useAuthStore"

const PUBLIC_LINKS = [
  { href: "/politicians", label: "Politicians", icon: Users, description: "Browse elected official profiles" },
  { href: "/elections", label: "Elections", icon: Vote, description: "Nigerian election results" },
  { href: "/legislature", label: "Legislature", icon: FileText, description: "Bills and legislation" },
  { href: "/anti-corruption", label: "Anti-Corruption", icon: AlertTriangle, description: "EFCC & ICPC cases" },
  { href: "/parties", label: "Parties", icon: BarChart3, description: "Political party data" },
  { href: "/search", label: "Search", icon: Search, description: "Search across all data" },
]

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

export function UserDashboard() {
  const { user, clearAuth } = useAuthStore()

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* User info */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-lg">
                  {user.displayName ?? user.email}
                </CardTitle>
                <Badge variant={roleBadgeVariant(user.role)}>{user.role}</Badge>
              </div>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex gap-3 flex-wrap">
          {user.role === "ADMIN" && (
            <Button asChild size="sm">
              <Link href="/admin">
                <Shield className="mr-1 h-3.5 w-3.5" />
                Admin Panel
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={clearAuth}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>

      {/* Quick links */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">Explore Platform</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PUBLIC_LINKS.map(({ href, label, icon: Icon, description }) => (
            <Link key={href} href={href} className="group">
              <Card className="h-full bg-card border-border/50 hover:border-primary/40 hover:bg-card/80 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <CardTitle className="text-sm font-medium">{label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
