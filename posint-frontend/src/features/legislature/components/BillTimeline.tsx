import type { BillReading } from "../api/legislature.types"

interface BillTimelineProps {
  readings: BillReading[]
  currentStatus: string
}

const STEPS = [
  "First Reading",
  "Second Reading",
  "Committee Review",
  "Third Reading",
  "Final Vote",
]

const STATUS_PROGRESS: Record<string, number> = {
  FIRST_READING: 20,
  SECOND_READING: 40,
  THIRD_READING: 60,
  PASSED: 100,
  REJECTED: 0,
}

export function BillTimeline({ readings, currentStatus }: BillTimelineProps) {
  const progress = STATUS_PROGRESS[currentStatus] ?? 0

  return (
    <div className="space-y-4">
      {STEPS.map((step, index) => {
        const stepProgress = (index + 1) * 20
        const isCompleted = progress >= stepProgress
        const isCurrent =
          currentStatus.replace(/_/g, " ") === step.toUpperCase() ||
          (index === 0 && currentStatus === "FIRST_READING") ||
          (index === 1 && currentStatus === "SECOND_READING") ||
          (index === 3 && currentStatus === "THIRD_READING")

        return (
          <div key={step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-4 h-4 rounded-full ${
                  isCompleted
                    ? "bg-status-success"
                    : isCurrent
                    ? "bg-status-warning"
                    : "bg-muted"
                }`}
              />
              {index < STEPS.length - 1 && (
                <div
                  className={`w-px h-8 ${
                    isCompleted ? "bg-status-success" : "bg-border"
                  }`}
                />
              )}
            </div>
            <div className="pb-4">
              <p
                className={`font-semibold ${
                  isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step}
              </p>
              <p className="text-sm text-muted-foreground">
                {isCompleted ? "Completed" : isCurrent ? "In Progress" : "Pending"}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
