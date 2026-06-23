import type { LucideIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; href: string }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <Icon className="h-12 w-12 text-muted-foreground/30 mb-4" />
      <h3 className="font-display font-semibold text-lg text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mb-6">{description}</p>
      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}
