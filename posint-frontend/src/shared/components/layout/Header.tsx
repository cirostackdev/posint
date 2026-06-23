"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Shield, Sun, Moon, Menu, Bell, LogOut, ChevronDown, User } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/shared/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { cn } from "@/shared/lib/utils"
import { useThemeStore } from "@/shared/stores/useThemeStore"
import { NAV_ITEMS } from "@/shared/config/nav"
import { GlobalSearch } from "@/features/search/components/GlobalSearch"
import { useAuthStore } from "@/shared/stores/useAuthStore"
import { apiPost } from "@/shared/lib/api"
import { toast } from "sonner"

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useThemeStore()
  const { user, isAuthenticated, clearAuth } = useAuthStore()

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")
  const isDark = theme === "dark"

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

  const displayName = user?.displayName ?? user?.email ?? "User"
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-glow">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight text-foreground">
              POSINT
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Political Intelligence
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              asChild
              className={cn(
                "text-sm font-medium",
                pathname === item.href
                  ? "text-foreground bg-primary/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
              )}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <GlobalSearch />
          <Button variant="ghost" size="icon" className="relative text-muted-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-status-danger text-[10px] font-bold text-white flex items-center justify-center">
              3
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex items-center gap-2 text-sm font-medium"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {initials}
                  </span>
                  <span className="max-w-[120px] truncate text-foreground">{displayName}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-foreground leading-none">
                      {user.displayName ?? "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === "ADMIN" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              className="hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground"
              size="sm"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-2 mt-8">
                {NAV_ITEMS.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    asChild
                    className={cn(
                      "justify-start",
                      pathname === item.href
                        ? "text-foreground bg-primary/5"
                        : "text-muted-foreground"
                    )}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
                <div className="border-t border-border/50 pt-4 mt-4 space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="justify-start text-muted-foreground w-full"
                  >
                    {isDark ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    {isDark ? "Light mode" : "Dark mode"}
                  </Button>
                  {isAuthenticated ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="justify-start text-destructive w-full"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  ) : (
                    <Button asChild variant="default" size="sm" className="w-full">
                      <Link href="/login">Sign In</Link>
                    </Button>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
