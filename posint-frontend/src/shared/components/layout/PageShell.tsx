import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/shared/lib/utils"

interface PageShellProps {
  children: React.ReactNode
  hero?: {
    icon: LucideIcon
    iconClassName?: string
    title: string
    description: string
    actions?: ReactNode
  }
  className?: string
}

export function PageShell({ children, hero, className }: PageShellProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {hero && (
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-8 md:py-12 border-b border-border/50">
          <div className="container px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className={cn("p-3 rounded-xl", hero.iconClassName || "bg-primary/10")}>
                  <hero.icon className={cn("h-6 w-6", !hero.iconClassName?.includes("text-") && "text-primary")} />
                </div>
                <div>
                  <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">
                    {hero.title}
                  </h1>
                  <p className="text-muted-foreground max-w-2xl">
                    {hero.description}
                  </p>
                </div>
              </div>
              {hero.actions && <div className="flex gap-3">{hero.actions}</div>}
            </div>
          </div>
        </section>
      )}
      <div className="container px-4">{children}</div>
    </div>
  )
}
