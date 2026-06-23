"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileText, Clock, CheckCircle2, XCircle, Calendar, Users, Building2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Progress } from "@/shared/components/ui/progress"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { formatDate } from "@/shared/lib/utils"
import { BillTimeline } from "./BillTimeline"
import { useBillById } from "../hooks/use-legislature"

const statusConfig: Record<string, { variant: "default" | "info" | "warning" | "success" | "danger"; icon: typeof Clock; progress: number }> = {
  FIRST_READING: { variant: "info", icon: Clock, progress: 20 },
  SECOND_READING: { variant: "warning", icon: Clock, progress: 40 },
  THIRD_READING: { variant: "warning", icon: Clock, progress: 60 },
  PASSED: { variant: "success", icon: CheckCircle2, progress: 100 },
  REJECTED: { variant: "danger", icon: XCircle, progress: 0 },
  WITHDRAWN: { variant: "default", icon: XCircle, progress: 0 },
}

export function BillDetailPage() {
  const { id } = useParams()
  const { data: bill, isLoading } = useBillById(id as string)

  if (isLoading) {
    return (
      <div className="container px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="container px-4 py-16 text-center">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Bill Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The legislative bill you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/legislature">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Legislature
          </Link>
        </Button>
      </div>
    )
  }

  const status = statusConfig[bill.status]
  const StatusIcon = status?.icon || Clock

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 md:py-12 border-b border-border/50">
        <div className="container px-4">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/legislature">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Legislature
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="flex-shrink-0 h-20 w-20 md:h-24 md:w-24 flex items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-10 w-10 md:h-12 md:w-12 text-primary" />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {bill.title}
                </h1>
                <Badge variant={status?.variant || "default"} className="text-sm">
                  <StatusIcon className="h-4 w-4 mr-1" />
                  {bill.status.replace(/_/g, " ")}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                {bill.politician && (
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Sponsor:{" "}
                    <span className="font-medium text-foreground">{bill.politician.name}</span>
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {bill.chamber.replace(/_/g, " ")}
                </span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(bill.dateIntroduced)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Bill Progress</span>
                  <span>{status?.progress ?? 0}%</span>
                </div>
                <Progress value={status?.progress ?? 0} className="h-2" />
              </div>
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
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Bill Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {bill.summary ? (
                    <p className="text-muted-foreground leading-relaxed">{bill.summary}</p>
                  ) : (
                    <>
                      <p className="text-muted-foreground leading-relaxed">
                        This bill was introduced in the {bill.chamber.replace(/_/g, " ")} on{" "}
                        {formatDate(bill.dateIntroduced)}
                        {bill.politician ? ` by ${bill.politician.name}` : ""}. It is currently
                        in the {bill.status.replace(/_/g, " ")} stage of the legislative process.
                      </p>
                      <p className="text-muted-foreground leading-relaxed mt-4">
                        The bill aims to address key policy concerns and has been referred to the
                        appropriate committee for deliberation. Further updates will be provided as
                        the bill progresses through the legislative process.
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Legislative Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <BillTimeline readings={bill.readings ?? []} currentStatus={bill.status} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Bill Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Bill ID</p>
                    <p className="font-semibold">HB-{bill.id.slice(-4).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Chamber</p>
                    <p className="font-semibold">{bill.chamber.replace(/_/g, " ")}</p>
                  </div>
                  {bill.politician && (
                    <div>
                      <p className="text-sm text-muted-foreground">Primary Sponsor</p>
                      <p className="font-semibold">{bill.politician.name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Date Introduced</p>
                    <p className="font-semibold">{formatDate(bill.dateIntroduced)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Status</p>
                    <Badge variant={status?.variant || "default"} className="mt-1">
                      {bill.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle>Related Bills</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    No related bills found at this time.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
