import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { cn } from "@/shared/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: { value: number; isPositive: boolean }
  className?: string
  valueClassName?: string
}

export function StatCard({ label, value, icon: Icon, trend, className, valueClassName }: StatCardProps) {
  return (
    <Card className={cn("border-border/50", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
            <p className={cn("text-2xl font-display font-bold text-foreground truncate", valueClassName)}>
              {value}
            </p>
            {trend && (
              <div className={cn("flex items-center gap-1 mt-1 text-xs", trend.isPositive ? "text-status-success" : "text-status-danger")}>
                {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
