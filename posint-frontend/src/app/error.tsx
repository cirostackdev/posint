"use client"

import { Button } from "@/shared/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center px-4">
        <AlertTriangle className="h-12 w-12 text-status-danger mx-auto mb-4" />
        <h2 className="text-xl font-display font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">{error.message}</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}
