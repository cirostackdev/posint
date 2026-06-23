"use client"

import { Briefcase } from "lucide-react"
import { EmptyState } from "@/shared/components/shared/EmptyState"
import type { CareerEvent } from "../api/politicians.types"

interface CareerTimelineProps {
  events: CareerEvent[]
}

export function CareerTimeline({ events }: CareerTimelineProps) {
  if (events.length === 0) {
    return <EmptyState icon={Briefcase} title="No career data" description="Career timeline not available." />
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-primary mt-0.5 flex-shrink-0" />
            {index < events.length - 1 && (
              <div className="w-px bg-border flex-1 min-h-[2rem] mt-1" />
            )}
          </div>
          <div className="pb-4">
            <p className="font-semibold text-foreground">{event.year}</p>
            <p className="text-sm text-muted-foreground">{event.title}</p>
            {event.description && (
              <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
