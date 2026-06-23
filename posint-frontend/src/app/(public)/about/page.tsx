import type { Metadata } from "next"
import { Shield, Database, Code, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { PageShell } from "@/shared/components/layout/PageShell"
import { DataSourceBadge } from "@/shared/components/shared/DataSourceBadge"

export const metadata: Metadata = {
  title: "About POSINT",
  description: "About the POSINT Nigerian Political Intelligence Platform.",
}

const PILLARS = [
  {
    icon: Database,
    title: "Data Integrity",
    description: "Every data point has a verifiable source. No unsourced claims.",
  },
  {
    icon: Code,
    title: "Open Source",
    description: "Built transparently with publicly available data.",
  },
  {
    icon: BookOpen,
    title: "Methodology",
    description: "Data is scraped from official government sources and verified manually.",
  },
  {
    icon: Shield,
    title: "Neutral Platform",
    description: "We present facts, not opinions. No editorial bias.",
  },
]

export default function AboutPage() {
  return (
    <PageShell
      hero={{
        icon: Shield,
        title: "About POSINT",
        description:
          "POSINT is an open-source political intelligence platform providing transparent access to Nigerian political data.",
      }}
    >
      <div className="py-10 max-w-4xl mx-auto space-y-12">
        {/* Core pillars */}
        <section>
          <h2 className="font-display text-xl font-bold text-foreground mb-6">Our Principles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {PILLARS.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-border/50">
                <CardContent className="p-6 flex gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Data sources */}
        <section id="sources" className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Data Sources</h2>
          <p className="text-muted-foreground mb-6">
            Data is sourced from official Nigerian government agencies.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <DataSourceBadge source="NASS" url="https://nass.gov.ng" />
            <DataSourceBadge source="INEC" url="https://inecnigeria.org" />
            <DataSourceBadge source="EFCC" url="https://efcc.gov.ng" />
            <DataSourceBadge source="ICPC" url="https://icpc.gov.ng" />
            <DataSourceBadge source="CCB" url="https://ccb.gov.ng" />
          </div>
        </section>
      </div>
    </PageShell>
  )
}
