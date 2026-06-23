"use client"

import Link from "next/link"
import { AlertTriangle, Gavel, Shield, ChevronRight } from "lucide-react"
import { Card } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { useCases } from "@/features/corruption/hooks/use-corruption"

const statusConfig: Record<string, { variant: "warning" | "danger" | "success" | "info" }> = {
  "Ongoing": { variant: "warning" },
  "Convicted": { variant: "danger" },
  "Acquitted": { variant: "success" },
  "Under Investigation": { variant: "info" },
}

function formatAmount(kobo: string | number | null): string {
  if (kobo === null || kobo === undefined) return "N/A"
  const naira = Number(kobo) / 100
  if (isNaN(naira)) return "N/A"
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(naira)
}

function extractYear(dateStr: string | null): string {
  if (!dateStr) return "N/A"
  return new Date(dateStr).getFullYear().toString()
}

export function CorruptionHighlights() {
  const { data, isLoading } = useCases({ page: 1 })

  if (isLoading) {
    return (
      <section className="py-12 md:py-16">
        <div className="container px-4">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-32 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-status-danger/10">
              <AlertTriangle className="h-6 w-6 text-status-danger" />
            </div>
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                Anti-Corruption Tracker
              </h2>
              <p className="text-muted-foreground">
                EFCC &amp; ICPC cases involving Nigerian politicians
              </p>
            </div>
          </div>
          <Button variant="outline" className="self-start md:self-auto" asChild>
            <Link href="/anti-corruption">
              View All Cases
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {(data?.data ?? []).slice(0, 4).map((case_, index) => {
            const status = statusConfig[case_.status] ?? { variant: "info" as const }

            return (
              <Link key={case_.id} href={`/anti-corruption/${case_.id}`}>
                <Card
                  className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 animate-scale-in cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                          {case_.politicianName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            {case_.agency}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {extractYear(case_.filingDate)}
                          </span>
                        </div>
                      </div>
                      <Badge variant={status.variant}>
                        {case_.status}
                      </Badge>
                    </div>

                    {/* Amount */}
                    <div className="p-3 rounded-lg bg-status-danger/5 border border-status-danger/20 mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Amount Involved</p>
                      <p className="text-xl font-display font-bold text-status-danger">
                        {formatAmount(case_.amountInvolvedKobo)}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {case_.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 bg-muted/50 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Gavel className="h-4 w-4" />
                      <span>Case Details</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
