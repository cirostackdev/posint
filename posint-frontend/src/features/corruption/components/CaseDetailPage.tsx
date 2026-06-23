"use client"

import Link from "next/link"
import { ArrowLeft, AlertTriangle, Shield, Gavel, Calendar, ExternalLink } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { formatNaira, formatDate } from "@/shared/lib/utils"
import { useCaseById } from "../hooks/use-corruption"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/shared/lib/api"
import type { CorruptionCase } from "../api/corruption.types"

const statusConfig: Record<string, { variant: "default" | "info" | "warning" | "success" | "danger"; description: string }> = {
  ONGOING: { variant: "warning", description: "The case is currently being tried in court." },
  CONVICTED: { variant: "danger", description: "The defendant has been found guilty and sentenced." },
  ACQUITTED: { variant: "success", description: "The defendant has been found not guilty and discharged." },
  UNDER_INVESTIGATION: { variant: "info", description: "The case is still under investigation by the relevant agency." },
  DISMISSED: { variant: "default", description: "The case has been dismissed by the court." },
  APPEALING: { variant: "warning", description: "The verdict is currently under appeal." },
}

export function CaseDetailPage() {
  const { id } = useParams()
  const caseId = id as string
  const { data: case_, isLoading } = useCaseById(caseId)

  const { data: relatedCases = [], isLoading: relatedLoading } = useQuery({
    queryKey: ['corruption', 'related', caseId],
    queryFn: () => apiGet<CorruptionCase[]>(`/corruption/cases/${caseId}/related`),
    enabled: !!caseId,
  })

  if (isLoading) {
    return (
      <div className="container px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!case_) {
    return (
      <div className="container px-4 py-16 text-center">
        <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Case Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The corruption case you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/anti-corruption">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Anti-Corruption
          </Link>
        </Button>
      </div>
    )
  }

  const status = statusConfig[case_.status]
  const statusVariant = status?.variant ?? "default"
  const displayStatus = case_.status.replace(/_/g, " ")
  const openedYear = case_.filingDate ? new Date(case_.filingDate).getFullYear() : null

  const statusIconClass =
    case_.status === "CONVICTED"
      ? "bg-status-danger/10"
      : case_.status === "ACQUITTED"
      ? "bg-status-success/10"
      : case_.status === "UNDER_INVESTIGATION"
      ? "bg-status-info/10"
      : "bg-status-warning/10"

  const statusGavelClass =
    case_.status === "CONVICTED"
      ? "text-status-danger"
      : case_.status === "ACQUITTED"
      ? "text-status-success"
      : case_.status === "UNDER_INVESTIGATION"
      ? "text-status-info"
      : "text-status-warning"

  const timelineThirdDotClass =
    case_.status === "CONVICTED"
      ? "bg-status-danger"
      : case_.status === "ACQUITTED"
      ? "bg-status-success"
      : "bg-muted"

  const isFinished = case_.status === "CONVICTED" || case_.status === "ACQUITTED"

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-status-danger/5 via-background to-status-warning/5 py-8 md:py-12 border-b border-border/50">
        <div className="container px-4">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/anti-corruption">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Anti-Corruption Tracker
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="flex-shrink-0 h-20 w-20 md:h-24 md:w-24 flex items-center justify-center rounded-xl bg-status-danger/10">
              <AlertTriangle className="h-10 w-10 md:h-12 md:w-12 text-status-danger" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {case_.politicianName}
                </h1>
                <Badge variant={statusVariant} className="text-sm">
                  {displayStatus}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {case_.agency}
                </span>
                {openedYear && (
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Case opened: {openedYear}
                  </span>
                )}
              </div>

              {/* Amount Card */}
              {case_.amountInvolvedKobo && Number(case_.amountInvolvedKobo) > 0 && (
                <Card className="max-w-sm border-status-danger/30 bg-status-danger/5">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground mb-1">Amount Involved</p>
                    <p className="text-3xl font-display font-bold text-status-danger">
                      {formatNaira(Number(case_.amountInvolvedKobo))}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 md:py-12">
        <div className="container px-4">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Case Description */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Case Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{case_.description}</p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    This case is being handled by the {case_.agency} (
                    {case_.agency === "EFCC"
                      ? "Economic and Financial Crimes Commission"
                      : case_.agency === "ICPC"
                      ? "Independent Corrupt Practices Commission"
                      : case_.agency}
                    ).{openedYear ? ` The investigation began in ${openedYear}` : ""}{" "}
                    {case_.charges && `and involves allegations of ${case_.charges.toLowerCase()}.`}
                  </p>
                </CardContent>
              </Card>

              {/* Case Status */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Case Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
                    <div className={`p-2 rounded-lg ${statusIconClass}`}>
                      <Gavel className={`h-5 w-5 ${statusGavelClass}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">{displayStatus}</p>
                      <p className="text-sm text-muted-foreground">{status?.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Case Timeline */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Case Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-status-success" />
                        <div className="w-px h-8 bg-border" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{openedYear ?? "—"}</p>
                        <p className="text-sm text-muted-foreground">Investigation opened by {case_.agency}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-status-warning" />
                        <div className="w-px h-8 bg-border" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {case_.filingDate ? formatDate(case_.filingDate) : "—"}
                        </p>
                        <p className="text-sm text-muted-foreground">Charges filed against defendant</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-4 h-4 rounded-full ${timelineThirdDotClass}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {isFinished ? "Verdict Delivered" : "Awaiting Verdict"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {case_.status === "CONVICTED"
                            ? "Defendant found guilty"
                            : case_.status === "ACQUITTED"
                            ? "Defendant discharged"
                            : "Case still in progress"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {case_.sourceUrl && (
                <a href={case_.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View Source
                  </Button>
                </a>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Case Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {case_.caseNumber && (
                    <div>
                      <p className="text-sm text-muted-foreground">Case Number</p>
                      <p className="font-semibold">{case_.caseNumber}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Agency</p>
                    <p className="font-semibold">{case_.agency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Defendant</p>
                    <p className="font-semibold">{case_.politicianName}</p>
                  </div>
                  {openedYear && (
                    <div>
                      <p className="text-sm text-muted-foreground">Year Opened</p>
                      <p className="font-semibold">{openedYear}</p>
                    </div>
                  )}
                  {case_.court && (
                    <div>
                      <p className="text-sm text-muted-foreground">Court</p>
                      <p className="font-semibold">{case_.court}</p>
                    </div>
                  )}
                  {case_.verdictDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Verdict Date</p>
                      <p className="font-semibold">{formatDate(case_.verdictDate)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Current Status</p>
                    <Badge variant={statusVariant} className="mt-1">
                      {displayStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Related Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  {relatedLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                      ))}
                    </div>
                  ) : relatedCases.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No related cases found at this time.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {relatedCases.map((related) => {
                        const relatedStatus = statusConfig[related.status]?.variant ?? "default"
                        const relatedDisplayStatus = related.status.replace(/_/g, " ")
                        return (
                          <Link
                            key={related.id}
                            href={`/anti-corruption/${related.id}`}
                            className="block p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-muted/50 transition-all"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-semibold text-sm text-foreground line-clamp-1">
                                {related.politicianName}
                              </p>
                              <Badge variant={relatedStatus} className="text-xs shrink-0">
                                {relatedDisplayStatus}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Shield className="h-3 w-3" />
                              <span>{related.agency}</span>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
