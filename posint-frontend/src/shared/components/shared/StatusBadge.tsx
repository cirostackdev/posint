import { cn } from "@/shared/lib/utils"

interface StatusBadgeProps {
  status: string
  variant?: "bill" | "case" | "project" | "vote"
  className?: string
}

const BILL_STATUS_STYLES: Record<string, string> = {
  FIRST_READING: "bg-status-info/15 text-status-info",
  SECOND_READING: "bg-status-warning/15 text-status-warning",
  THIRD_READING: "bg-status-warning/15 text-status-warning",
  PASSED: "bg-status-success/15 text-status-success",
  REJECTED: "bg-status-danger/15 text-status-danger",
  WITHDRAWN: "bg-muted text-muted-foreground",
}

const CASE_STATUS_STYLES: Record<string, string> = {
  UNDER_INVESTIGATION: "bg-status-info/15 text-status-info",
  ONGOING: "bg-status-warning/15 text-status-warning",
  CONVICTED: "bg-status-danger/15 text-status-danger",
  ACQUITTED: "bg-status-success/15 text-status-success",
  DISMISSED: "bg-muted text-muted-foreground",
  APPEALING: "bg-status-warning/15 text-status-warning",
}

const VOTE_STATUS_STYLES: Record<string, string> = {
  YES: "bg-status-success/15 text-status-success",
  NO: "bg-status-danger/15 text-status-danger",
  ABSTAIN: "bg-status-warning/15 text-status-warning",
  ABSENT: "bg-muted text-muted-foreground",
}

const PROJECT_STATUS_STYLES: Record<string, string> = {
  NOT_STARTED: "bg-muted text-muted-foreground",
  ONGOING: "bg-status-info/15 text-status-info",
  COMPLETED: "bg-status-success/15 text-status-success",
  ABANDONED: "bg-status-danger/15 text-status-danger",
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

export function StatusBadge({ status, variant = "bill", className }: StatusBadgeProps) {
  let styleMap = BILL_STATUS_STYLES
  if (variant === "case") styleMap = CASE_STATUS_STYLES
  else if (variant === "vote") styleMap = VOTE_STATUS_STYLES
  else if (variant === "project") styleMap = PROJECT_STATUS_STYLES

  const style = styleMap[status] ?? "bg-muted text-muted-foreground"

  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
      style,
      className
    )}>
      {formatStatus(status)}
    </span>
  )
}
