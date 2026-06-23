"use client"

import { Search, Filter, X } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"

interface FilterConfig {
  label: string
  key: string
  options: { value: string; label: string }[]
}

interface QuickFilter {
  label: string
  key: string
  value: string
}

interface SearchFilterProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  placeholder: string
  filters: FilterConfig[]
  activeFilters: Record<string, string | null>
  onFilterChange: (key: string, value: string | null) => void
  onClear: () => void
  quickFilters?: QuickFilter[]
  resultCount?: number
  totalCount?: number
}

export function SearchFilter({
  searchTerm,
  onSearchChange,
  placeholder,
  filters,
  activeFilters,
  onFilterChange,
  onClear,
  quickFilters = [],
  resultCount,
  totalCount,
}: SearchFilterProps) {
  const hasActiveFilters = Object.values(activeFilters).some((v) => v !== null) || searchTerm !== ""

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              value={activeFilters[filter.key] || "all"}
              onValueChange={(value) =>
                onFilterChange(filter.key, value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filter.label}</SelectItem>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Quick Filters */}
      {quickFilters.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <span className="text-sm text-muted-foreground flex-shrink-0">Quick filters:</span>
          {quickFilters.map((qf) => (
            <Button
              key={`${qf.key}-${qf.value}`}
              variant={activeFilters[qf.key] === qf.value ? "default" : "outline"}
              size="sm"
              onClick={() =>
                onFilterChange(
                  qf.key,
                  activeFilters[qf.key] === qf.value ? null : qf.value
                )
              }
              className="flex-shrink-0"
            >
              {qf.label}
            </Button>
          ))}
        </div>
      )}

      {/* Result Count */}
      {resultCount !== undefined && totalCount !== undefined && (
        <p className="text-xs text-muted-foreground">
          Showing {resultCount.toLocaleString()} of {totalCount.toLocaleString()}
        </p>
      )}
    </div>
  )
}
