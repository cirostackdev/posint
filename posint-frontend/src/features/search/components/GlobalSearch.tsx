"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, Users, FileText, Shield, Vote, Loader2 } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command"
import { useGlobalSearch } from "../hooks/use-search"
import { useDebouncedValue } from "../hooks/use-debounced-value"
import type { SearchResult } from "../hooks/use-search"

const ENTITY_ICONS: Record<string, typeof Users> = {
  politician: Users,
  bill: FileText,
  case: Shield,
  election: Vote,
}

const ENTITY_LABELS: Record<string, string> = {
  politician: "Politicians",
  bill: "Bills",
  case: "Cases",
  election: "Elections",
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const debouncedQuery = useDebouncedValue(query, 300)
  const router = useRouter()

  const { data: results = [], isLoading } = useGlobalSearch(debouncedQuery)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = useCallback((result: SearchResult) => {
    setOpen(false)
    setQuery("")
    if (result.entityType === "politician" && result.slug) {
      router.push(`/politicians/${result.slug}`)
    } else if (result.entityType === "bill") {
      router.push(`/legislature/${result.entityId}`)
    } else if (result.entityType === "case") {
      router.push(`/anti-corruption/${result.entityId}`)
    } else if (result.entityType === "election") {
      router.push(`/elections/${result.entityId}`)
    }
  }, [router])

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.entityType]) acc[r.entityType] = []
    acc[r.entityType].push(r)
    return acc
  }, {})

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-md border border-border/50 bg-muted/50 text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-2 text-[10px] bg-background border border-border rounded px-1">⌘K</kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search politicians, bills, cases..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {isLoading && debouncedQuery.length >= 2 && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && debouncedQuery.length >= 2 && results.length === 0 && (
            <CommandEmpty>No results found for &ldquo;{debouncedQuery}&rdquo;</CommandEmpty>
          )}

          {!isLoading && debouncedQuery.length < 2 && (
            <CommandEmpty>Type at least 2 characters to search...</CommandEmpty>
          )}

          {Object.entries(grouped).map(([type, items]) => {
            const Icon = ENTITY_ICONS[type] ?? Search
            return (
              <CommandGroup key={type} heading={ENTITY_LABELS[type] ?? type}>
                {items.map((result) => (
                  <CommandItem
                    key={result.entityId}
                    value={`${result.entityId}-${result.title}`}
                    onSelect={() => handleSelect(result)}
                  >
                    <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <div className="flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )
          })}
        </CommandList>
      </CommandDialog>
    </>
  )
}
