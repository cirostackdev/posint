"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Users,
  MapPin,
  TrendingUp,
  Building,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { getInitials } from "@/shared/lib/utils"
import { usePartyBySlug, useParties } from "../hooks/use-parties"

export function PartyDetailPage() {
  const { slug } = useParams()
  const { data: party, isLoading } = usePartyBySlug(slug as string)
  const { data: allParties = [] } = useParties()

  if (isLoading) {
    return (
      <div className="container px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!party) {
    return (
      <div className="container px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Party Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The party you&apos;re looking for doesn&apos;t exist in our database.
        </p>
        <Button asChild>
          <Link href="/parties">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Parties
          </Link>
        </Button>
      </div>
    )
  }

  const totalSeats = allParties.reduce((acc, p) => acc + p.seatsTotal, 0) || 469
  const seatPercentage = totalSeats > 0 ? (party.seatsTotal / totalSeats) * 100 : 0

  const senateSeats = party.senateSeats ?? 0
  const houseSeats = party.houseSeats ?? 0

  const chamberPieData = [
    { name: "Senate", value: senateSeats },
    { name: "House", value: houseSeats },
  ].filter((d) => d.value > 0)

  const partyPoliticians = party.politicians ?? []
  const avgAttendance = party.avgAttendance ?? 0
  const totalBills = party.totalBills ?? 0
  const totalCorruption = party.corruptionCases ?? 0
  const defectionsInto = party.defectionsInto ?? []
  const defectionsOut = party.defectionsOut ?? []

  const seatComparisonData = allParties.map((p) => ({
    name: p.abbreviation,
    seats: p.seatsTotal,
    isCurrentParty: p.abbreviation === party.abbreviation,
    color: p.color,
  }))

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 md:py-12 border-b border-border/50">
        <div className="container px-4">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/parties">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Parties
            </Link>
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: party.color }}
            />
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground">
              {party.abbreviation}
            </h1>
            <Badge variant="outline" className="text-sm px-3 py-1">
              {seatPercentage.toFixed(1)}% of seats
            </Badge>
          </div>
          <p className="text-lg text-muted-foreground">{party.name}</p>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="container px-4 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-display font-bold text-foreground">{party.seatsTotal}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Seats</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-display font-bold text-foreground">{party.governors}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Governors</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-display font-bold text-foreground">{totalBills}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Bills Sponsored</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <p
                  className={`text-2xl font-display font-bold ${
                    avgAttendance >= 80
                      ? "text-status-success"
                      : avgAttendance >= 60
                      ? "text-status-warning"
                      : "text-status-danger"
                  }`}
                >
                  {avgAttendance}%
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Attendance</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 text-center">
                <p
                  className={`text-2xl font-display font-bold ${
                    totalCorruption > 0 ? "text-status-danger" : "text-status-success"
                  }`}
                >
                  {totalCorruption}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Corruption Cases</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="flex-wrap h-auto gap-1">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members ({partyPoliticians.length})</TabsTrigger>
              <TabsTrigger value="seats">Seat Distribution</TabsTrigger>
              <TabsTrigger value="defections">Defections</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    About {party.abbreviation}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {party.fullDescription ??
                      party.description ??
                      "Information about this party is not yet available."}
                  </p>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Seat Share in National Assembly</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Overall</span>
                          <span className="font-semibold">
                            {party.seatsTotal} / {totalSeats}
                          </span>
                        </div>
                        <Progress value={seatPercentage} className="h-3" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Senate</span>
                          <span className="font-semibold">{senateSeats} / 109</span>
                        </div>
                        <Progress value={(senateSeats / 109) * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">House of Reps</span>
                          <span className="font-semibold">{houseSeats} / 360</span>
                        </div>
                        <Progress value={(houseSeats / 360) * 100} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Chamber Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chamberPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            <Cell fill="hsl(var(--primary))" />
                            <Cell fill="hsl(var(--muted-foreground))" />
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                              color: "hsl(var(--foreground))",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Members */}
            <TabsContent value="members">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partyPoliticians.map((pol) => (
                  <Link key={pol.id} href={`/politicians/${pol.slug}`}>
                    <Card className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={pol.photoUrl ?? ""} alt={pol.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(pol.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">{pol.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{pol.position}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground truncate">{pol.state}</span>
                          </div>
                        </div>
                        <div className="text-right text-xs space-y-1">
                          <p className="font-semibold">{pol.billsSponsored} bills</p>
                          <p
                            className={
                              pol.attendanceRate >= 80
                                ? "text-status-success"
                                : "text-status-warning"
                            }
                          >
                            {pol.attendanceRate}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {partyPoliticians.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No tracked politicians for this party yet.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Seat Distribution */}
            <TabsContent value="seats">
              <Card>
                <CardHeader>
                  <CardTitle>{party.abbreviation} vs Other Parties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={seatComparisonData} margin={{ left: 0, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        />
                        <YAxis
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                            color: "hsl(var(--foreground))",
                          }}
                        />
                        <Bar dataKey="seats" name="Seats" radius={[4, 4, 0, 0]}>
                          {seatComparisonData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={
                                entry.isCurrentParty
                                  ? entry.color
                                  : "hsl(var(--muted))"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Defections */}
            <TabsContent value="defections" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-status-success">
                      <TrendingUp className="h-5 w-5" />
                      Defected INTO {party.abbreviation} ({defectionsInto.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {defectionsInto.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Politician</TableHead>
                            <TableHead>From</TableHead>
                            <TableHead>Year</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {defectionsInto.map((d, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{d.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{d.from}</Badge>
                              </TableCell>
                              <TableCell>{d.year}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No recorded defections into {party.abbreviation}.
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-status-danger">
                      <TrendingUp className="h-5 w-5 rotate-180" />
                      Defected OUT of {party.abbreviation} ({defectionsOut.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {defectionsOut.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Politician</TableHead>
                            <TableHead>To</TableHead>
                            <TableHead>Year</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {defectionsOut.map((d, i) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">{d.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{d.to}</Badge>
                              </TableCell>
                              <TableCell>{d.year}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No recorded defections out of {party.abbreviation}.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}
