"use client"

import { HeroSection } from "./HeroSection"
import { StatsGrid } from "./StatsGrid"
import { FeaturedPoliticians } from "./FeaturedPoliticians"
import { PartyBreakdown } from "./PartyBreakdown"
import { RecentLegislation } from "./RecentLegislation"
import { CorruptionHighlights } from "./CorruptionHighlights"
import { DataSourcesSection } from "./DataSourcesSection"

export function HomePage() {
  return (
    <div>
      <HeroSection />
      <StatsGrid />
      <FeaturedPoliticians />
      <PartyBreakdown />
      <RecentLegislation />
      <CorruptionHighlights />
      <DataSourcesSection />
    </div>
  )
}
