import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-status-success/15 text-status-success",
        warning: "border-transparent bg-status-warning/15 text-status-warning",
        danger: "border-transparent bg-status-danger/15 text-status-danger",
        info: "border-transparent bg-status-info/15 text-status-info",
        apc: "border-transparent bg-party-apc/15 text-party-apc",
        pdp: "border-transparent bg-party-pdp/15 text-party-pdp",
        lp: "border-transparent bg-party-lp/15 text-party-lp",
        nnpp: "border-transparent bg-party-nnpp/15 text-party-nnpp",
        apga: "border-transparent bg-party-apga/15 text-party-apga",
        nigeria: "border-transparent bg-primary/15 text-primary",
        gold: "border-transparent bg-accent/20 text-accent-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { badgeVariants }
