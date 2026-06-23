"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, GitCompareArrows } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { usePoliticians } from "@/features/politicians/hooks/use-politicians"
import { CompareSelector } from "./CompareSelector"
import { SentimentComparison } from "./SentimentComparison"
import { VotingComparison } from "./VotingComparison"
import { BillsComparison } from "./BillsComparison"
import { AssetsComparison } from "./AssetsComparison"
import { ProjectsComparison } from "./ProjectsComparison"
import { DefectionComparison } from "./DefectionComparison"

export function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const { data: politiciansData, isLoading } = usePoliticians({ limit: 100 })

  const politicians = politiciansData?.data ?? []

  const handleAdd = (id: string) => {
    if (!selectedIds.includes(id) && selectedIds.length < 4) {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleRemove = (id: string) => {
    setSelectedIds(selectedIds.filter((sid) => sid !== id))
  }

  const selectedPoliticians = selectedIds
    .map((id) => politicians.find((p) => p.id === id))
    .filter(Boolean) as NonNullable<typeof politicians>

  const canCompare = selectedIds.length >= 2

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 md:py-12 border-b border-border/50">
          <div className="container px-4">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
        </section>
        <section className="py-8 md:py-12">
          <div className="container px-4">
            <Skeleton className="h-48 w-full" />
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 md:py-12 border-b border-border/50">
        <div className="container px-4">
          <Button variant="ghost" size="sm" asChild className="mb-6">
            <Link href="/politicians">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Politicians
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <GitCompareArrows className="h-8 w-8 text-primary" />
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground">
              Compare Politicians
            </h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Select up to 4 politicians to compare their voting records, sentiment, assets,
            sponsored bills, and constituency projects side by side.
          </p>
        </div>
      </section>

      <section className="py-8 md:py-12 flex-1">
        <div className="container px-4 space-y-8">
          {/* Politician Selector */}
          <CompareSelector
            politicians={politicians}
            selectedIds={selectedIds}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />

          {/* Comparison Content */}
          {canCompare ? (
            <Tabs defaultValue="sentiment" className="space-y-6">
              <TabsList className="flex-wrap h-auto gap-1">
                <TabsTrigger value="sentiment">Sentiment &amp; Engagement</TabsTrigger>
                <TabsTrigger value="voting">Voting Records</TabsTrigger>
                <TabsTrigger value="bills">Sponsored Bills</TabsTrigger>
                <TabsTrigger value="assets">Asset Declarations</TabsTrigger>
                <TabsTrigger value="projects">Constituency Projects</TabsTrigger>
                <TabsTrigger value="defections">Party Defections</TabsTrigger>
              </TabsList>

              <TabsContent value="sentiment">
                <SentimentComparison politicians={selectedPoliticians} />
              </TabsContent>

              <TabsContent value="voting">
                <VotingComparison politicians={selectedPoliticians} />
              </TabsContent>

              <TabsContent value="bills">
                <BillsComparison politicians={selectedPoliticians} />
              </TabsContent>

              <TabsContent value="assets">
                <AssetsComparison politicians={selectedPoliticians} />
              </TabsContent>

              <TabsContent value="projects">
                <ProjectsComparison politicians={selectedPoliticians} />
              </TabsContent>

              <TabsContent value="defections">
                <DefectionComparison politicians={selectedPoliticians} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <GitCompareArrows className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Select at least 2 politicians to start comparing.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
