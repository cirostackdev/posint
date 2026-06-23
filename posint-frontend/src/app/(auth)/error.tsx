"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6">{error.message}</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}
