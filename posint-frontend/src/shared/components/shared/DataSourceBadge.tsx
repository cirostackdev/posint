import { ExternalLink } from "lucide-react"
import { cn } from "@/shared/lib/utils"

interface DataSourceBadgeProps {
  source: string
  url?: string
  className?: string
}

export function DataSourceBadge({ source, url, className }: DataSourceBadgeProps) {
  const badge = (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground",
      url && "hover:border-primary/30 hover:text-foreground transition-colors cursor-pointer",
      className
    )}>
      {source}
      {url && <ExternalLink className="h-3 w-3" />}
    </span>
  )

  if (url) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {badge}
      </a>
    )
  }
  return badge
}
