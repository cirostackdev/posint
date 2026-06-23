"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
      <h2 className="text-lg font-semibold text-foreground mb-2">Dashboard error</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
