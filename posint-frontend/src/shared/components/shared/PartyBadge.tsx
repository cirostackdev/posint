import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/lib/utils"

interface PartyBadgeProps {
  party: string
  size?: "sm" | "md" | "lg"
  className?: string
}

const PARTY_VARIANT_MAP: Record<string, string> = {
  APC: "bg-party-apc/15 text-party-apc border-party-apc/30",
  PDP: "bg-party-pdp/15 text-party-pdp border-party-pdp/30",
  LP: "bg-party-lp/15 text-party-lp border-party-lp/30",
  NNPP: "bg-party-nnpp/15 text-party-nnpp border-party-nnpp/30",
  APGA: "bg-party-apga/15 text-party-apga border-party-apga/30",
  SDP: "bg-party-sdp/15 text-party-sdp border-party-sdp/30",
}

const SIZE_MAP = {
  sm: "text-[10px] px-1.5 py-0",
  md: "text-xs px-2.5 py-0.5",
  lg: "text-sm px-3 py-1",
}

export function PartyBadge({ party, size = "md", className }: PartyBadgeProps) {
  const variantClass = PARTY_VARIANT_MAP[party] ?? "bg-muted text-muted-foreground"

  return (
    <span className={cn(
      "inline-flex items-center rounded-full border font-semibold",
      SIZE_MAP[size],
      variantClass,
      className
    )}>
      {party}
    </span>
  )
}
