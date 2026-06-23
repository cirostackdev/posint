import { Database, ExternalLink } from "lucide-react"
import { Card } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"

const sources = [
  {
    name: "INEC",
    fullName: "Independent National Electoral Commission",
    type: "Primary",
    data: ["Election Results", "Candidate Lists", "Voter Registration"],
    url: "https://inecnigeria.org",
  },
  {
    name: "NASS",
    fullName: "National Assembly",
    type: "Primary",
    data: ["Bills", "Votes", "Member Profiles"],
    url: "https://nass.gov.ng",
  },
  {
    name: "Open Treasury",
    fullName: "Open Treasury Portal",
    type: "Primary",
    data: ["Government Payments", "Contracts", "Budget Data"],
    url: "https://opentreasury.gov.ng",
  },
  {
    name: "BudgIT",
    fullName: "BudgIT Nigeria",
    type: "Analytics",
    data: ["Budget Analysis", "Project Tracking", "State Finances"],
    url: "https://budgit.org",
  },
  {
    name: "EFCC",
    fullName: "Economic & Financial Crimes Commission",
    type: "Primary",
    data: ["Corruption Cases", "Convictions", "Asset Recovery"],
    url: "https://efcc.gov.ng",
  },
  {
    name: "Premium Times",
    fullName: "Premium Times Investigations",
    type: "Media",
    data: ["Investigations", "Political News", "Analysis"],
    url: "https://premiumtimesng.com",
  },
]

export function DataSourcesSection() {
  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Open Source Intelligence
            </span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            Verified Data Sources
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            All information is aggregated from official government portals, civic tech organizations,
            and reputable news sources
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((source, index) => (
            <Card
              key={source.name}
              className="p-5 border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1">
                    {source.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {source.fullName}
                  </p>
                </div>
                <Badge variant={source.type === "Primary" ? "nigeria" : source.type === "Analytics" ? "info" : "outline"}>
                  {source.type}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {source.data.map((item) => (
                  <span
                    key={item}
                    className="px-2 py-0.5 text-xs bg-muted rounded-md text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Visit Source
                <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
