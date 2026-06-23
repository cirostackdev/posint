"use client"

import { Users } from "lucide-react"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { PageShell } from "@/shared/components/layout/PageShell"
import { SearchFilter } from "@/shared/components/shared/SearchFilter"
import { NIGERIAN_STATES } from "@/shared/lib/constants"
import { PoliticianCard } from "./PoliticianCard"
import { usePoliticians } from "../hooks/use-politicians"
import { usePoliticiansStore } from "../store/usePoliticiansStore"

const PARTIES = ["APC", "PDP", "LP", "NNPP", "APGA", "SDP"]

export function PoliticiansPage() {
  const { page, search, party, state, chamber, setPage, setSearch, setFilter, clearFilters } = usePoliticiansStore()

  const { data, isLoading } = usePoliticians({ page, search, party, state, chamber })

  const activeFilters: Record<string, string | null> = { party: party ?? null, state: state ?? null, chamber: chamber ?? null }

  return (
    <PageShell
      hero={{
        icon: Users,
        iconClassName: "bg-primary/10 text-primary",
        title: "Politicians Database",
        description: "Browse comprehensive profiles of Nigerian elected officials. Track their performance, voting records, and legislative activities.",
      }}
    >
      <section className="py-8">
        <div className="container px-4">
          <SearchFilter
            searchTerm={search}
            onSearchChange={setSearch}
            placeholder="Search by name, constituency, or state..."
            filters={[
              {
                label: "Party",
                key: "party",
                options: PARTIES.map((p) => ({ value: p, label: p })),
              },
              {
                label: "State",
                key: "state",
                options: NIGERIAN_STATES.map((s) => ({ value: s, label: s })),
              },
            ]}
            activeFilters={activeFilters}
            onFilterChange={setFilter}
            onClear={clearFilters}
            quickFilters={[
              { label: "APC", key: "party", value: "APC" },
              { label: "PDP", key: "party", value: "PDP" },
              { label: "LP", key: "party", value: "LP" },
              { label: "NNPP", key: "party", value: "NNPP" },
              { label: "APGA", key: "party", value: "APGA" },
            ]}
          />

          {isLoading ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          ) : (
            <>
              <div className="mt-6 mb-4 text-sm text-muted-foreground">
                Showing {data?.data?.length ?? 0} of {data?.meta?.total ?? 0} politicians
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(data?.data ?? []).map((politician, index) => (
                  <div
                    key={politician.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <PoliticianCard politician={politician} index={index} />
                  </div>
                ))}
              </div>

              {!data?.data?.length && (
                <div className="text-center py-16">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No politicians found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}

              {/* Pagination */}
              {data?.meta && data.meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-md border border-border/50 text-sm disabled:opacity-50 hover:bg-muted transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm text-muted-foreground">
                    Page {page} of {data.meta.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(data.meta!.totalPages, page + 1))}
                    disabled={page === data.meta.totalPages}
                    className="px-4 py-2 rounded-md border border-border/50 text-sm disabled:opacity-50 hover:bg-muted transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </PageShell>
  )
}
