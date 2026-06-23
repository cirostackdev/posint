"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Filter, ChevronRight } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { PoliticianCard } from "@/features/politicians/components/PoliticianCard"
import { usePoliticians } from "@/features/politicians/hooks/use-politicians"

export function FeaturedPoliticians() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedParty, setSelectedParty] = useState<string | null>(null)
  const { data, isLoading } = usePoliticians({ limit: 20 })

  const parties = ["APC", "PDP", "LP", "NNPP", "APGA"]

  const politicians = data?.data ?? []

  const filteredPoliticians = politicians.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.constituency.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesParty = !selectedParty || p.party === selectedParty
    return matchesSearch && matchesParty
  })

  if (isLoading) {
    return (
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container px-4">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Politicians Database
            </h2>
            <p className="text-muted-foreground">
              Browse profiles of Nigerian elected officials and track their performance
            </p>
          </div>
          <Button variant="outline" className="self-start md:self-auto" asChild>
            <Link href="/politicians">
              View All Politicians
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or constituency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <div className="h-6 w-px bg-border" />
            {parties.map((party) => (
              <Button
                key={party}
                variant={selectedParty === party ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedParty(selectedParty === party ? null : party)}
                className="flex-shrink-0"
              >
                {party}
              </Button>
            ))}
          </div>
        </div>

        {/* Politicians Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPoliticians.slice(0, 6).map((politician, index) => (
            <div
              key={politician.slug}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PoliticianCard politician={politician} />
            </div>
          ))}
        </div>

        {filteredPoliticians.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No politicians found matching your criteria.</p>
          </div>
        )}
      </div>
    </section>
  )
}
