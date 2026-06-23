"use client"

import Link from "next/link"
import { ArrowLeft, AlertTriangle, Calendar, GraduationCap, MapPin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { Progress } from "@/shared/components/ui/progress"
import { PartyBadge } from "@/shared/components/shared/PartyBadge"
import { getInitials } from "@/shared/lib/utils"
import { VotingRecordTable } from "./VotingRecordTable"
import { BillsList } from "./BillsList"
import { AssetTimeline } from "./AssetTimeline"
import { DefectionHistory } from "./DefectionHistory"
import { CareerTimeline } from "./CareerTimeline"
import { ContactCard } from "./ContactCard"
import {
  usePoliticianBySlug,
  usePoliticianVotingRecords,
  usePoliticianBills,
  usePoliticianAssets,
  usePoliticianProjects,
  usePoliticianDefections,
  usePoliticianCareer,
  usePoliticianCommittees,
} from "../hooks/use-politicians"

interface PoliticianProfilePageProps {
  slug: string
}

export function PoliticianProfilePage({ slug }: PoliticianProfilePageProps) {
  const { data: politician, isLoading } = usePoliticianBySlug(slug)
  const { data: votingRecords = [] } = usePoliticianVotingRecords(slug)
  const { data: bills = [] } = usePoliticianBills(slug)
  const { data: assets = [] } = usePoliticianAssets(slug)
  const { data: projects = [] } = usePoliticianProjects(slug)
  const { data: defections = [] } = usePoliticianDefections(slug)
  const { data: career = [] } = usePoliticianCareer(slug)
  const { data: committees = [] } = usePoliticianCommittees(slug)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-16 space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="flex gap-6">
            <Skeleton className="h-36 w-36 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-96" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!politician) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Politician Not Found</h1>
          <p className="text-muted-foreground mb-8">The politician you're looking for doesn't exist in our database.</p>
          <Button asChild>
            <Link href="/politicians">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Politicians
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 md:py-12 border-b border-border/50">
        <div className="container px-4">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/politicians">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Politicians
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <Avatar className="h-28 w-28 md:h-36 md:w-36 ring-4 ring-border ring-offset-4 ring-offset-background">
              <AvatarImage src={politician.photoUrl ?? ""} alt={politician.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {getInitials(politician.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground">
                  {politician.name}
                </h1>
                {(politician as any).corruptionCases > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {(politician as any).corruptionCases} Case{(politician as any).corruptionCases > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              <p className="text-lg text-muted-foreground mb-3">{politician.position}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                <PartyBadge party={typeof politician.party === 'string' ? politician.party : politician.party.abbreviation} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>{politician.constituency}, {politician.state}</span>
                </div>
                {politician.education && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="h-4 w-4 flex-shrink-0" />
                    <span>{politician.education}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>{politician.yearsInOffice} years in public office</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
              <Card className="text-center">
                <CardContent className="p-4">
                  <p className="text-2xl font-display font-bold text-foreground">{politician.billsSponsored}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Bills</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <p className={`text-2xl font-display font-bold ${
                    politician.attendanceRate >= 80 ? "text-status-success" :
                    politician.attendanceRate >= 60 ? "text-status-warning" :
                    "text-status-danger"
                  }`}>
                    {politician.attendanceRate}%
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Attendance</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-4">
                  <p className="text-2xl font-display font-bold text-foreground">{politician.yearsInOffice}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Years</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="py-8 md:py-12">
        <div className="container px-4">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="defections">Party Defections</TabsTrigger>
              <TabsTrigger value="voting">Voting Records</TabsTrigger>
              <TabsTrigger value="bills">Sponsored Bills</TabsTrigger>
              <TabsTrigger value="assets">Asset Declarations</TabsTrigger>
              <TabsTrigger value="projects">Constituency Projects</TabsTrigger>
              <TabsTrigger value="social">Social & Sentiment</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Biography */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Biography</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {(politician as any).biography ?? "Biography information is not yet available for this politician."}
                    </p>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <ContactCard contacts={(politician as any).contacts} />
              </div>

              {/* Career Timeline & Committees */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Career Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CareerTimeline events={career} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Committee Assignments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {committees.length > 0 ? (
                        committees.map((c: any) => (
                          <div key={c.id} className="p-3 rounded-lg bg-muted/50 border border-border/50">
                            <p className="font-medium text-foreground">{c.committeeName}</p>
                            <div className="flex justify-between items-center mt-1">
                              <Badge variant="outline" className="text-xs">{c.role}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {c.startDate ? new Date(c.startDate).getFullYear() : "—"} -{" "}
                                {c.endDate ? new Date(c.endDate).getFullYear() : "Present"}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No committee assignments found.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Party Defections Tab */}
            <TabsContent value="defections">
              <DefectionHistory
                defections={defections}
                currentParty={typeof politician.party === 'string' ? politician.party : politician.party.abbreviation}
                politicianName={politician.name}
              />
            </TabsContent>

            {/* Voting Records Tab */}
            <TabsContent value="voting">
              <Card>
                <CardHeader>
                  <CardTitle>Voting Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <VotingRecordTable records={votingRecords} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sponsored Bills Tab */}
            <TabsContent value="bills">
              <BillsList bills={bills} />
            </TabsContent>

            {/* Asset Declarations Tab */}
            <TabsContent value="assets">
              <Card>
                <CardHeader>
                  <CardTitle>Asset Declarations</CardTitle>
                </CardHeader>
                <CardContent>
                  <AssetTimeline declarations={assets} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Constituency Projects Tab */}
            <TabsContent value="projects">
              <div className="space-y-4">
                {projects.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">No constituency projects found for this politician.</p>
                    </CardContent>
                  </Card>
                ) : (
                  projects.map((p: any) => (
                    <Card key={p.id}>
                      <CardHeader>
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <CardTitle className="text-lg">{p.title}</CardTitle>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                            p.status === "COMPLETED" ? "bg-status-success/20 text-status-success" :
                            p.status === "ONGOING" ? "bg-status-warning/20 text-status-warning" :
                            p.status === "ABANDONED" ? "bg-status-danger/20 text-status-danger" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {p.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {p.location}
                          </span>
                          <span className="text-muted-foreground">Year: {p.year}</span>
                        </div>
                        {p.status === "ONGOING" && (
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{p.completionPct ?? 0}%</span>
                            </div>
                            <Progress value={p.completionPct ?? 0} className="h-2" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Social & Sentiment Tab */}
            <TabsContent value="social">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Social media data and public sentiment analysis are not yet available for this politician.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}
