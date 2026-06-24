import type { BillReading } from "../api/legislature.types"

interface BillTimelineProps {
  readings: BillReading[]
  currentStatus: string
}

const READING_LABELS: Record<number, string> = {
  1: "First Reading",
  2: "Second Reading",
  3: "Third Reading",
}

const ORDINAL: Record<number, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
}

const ALL_READING_NUMBERS = [1, 2, 3]

const STATUS_PROGRESS: Record<string, number> = {
  FIRST_READING: 20,
  SECOND_READING: 40,
  THIRD_READING: 60,
  PASSED: 100,
  REJECTED: 0,
}

const STEPS = [
  "First Reading",
  "Second Reading",
  "Committee Review",
  "Third Reading",
  "Final Vote",
]

export function BillTimeline({ readings, currentStatus }: BillTimelineProps) {
  if (readings && readings.length > 0) {
    // Build a map of readingNumber -> BillReading for quick lookup
    const readingMap = new Map<number, BillReading>()
    for (const r of readings) {
      readingMap.set(r.readingNumber, r)
    }

    // Determine the highest reading number that has been completed
    const completedNumbers = new Set(readingMap.keys())

    // Build the list of steps: all three reading slots, filled or pending
    const steps = ALL_READING_NUMBERS.map((num) => {
      const reading = readingMap.get(num)
      return { num, reading }
    })

    return (
      <div className="space-y-4">
        {steps.map(({ num, reading }, index) => {
          const isCompleted = !!reading
          const label = READING_LABELS[num] ?? `Reading ${num}`

          return (
            <div key={num} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 rounded-full ${
                    isCompleted ? "bg-status-success" : "bg-muted"
                  }`}
                />
                {index < steps.length - 1 && (
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
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </p>
                {isCompleted && reading ? (
                  <div className="text-sm text-muted-foreground space-y-0.5">
                    <p>{new Date(reading.date).toLocaleDateString()}</p>
                    <p className="capitalize">{reading.outcome}</p>
                    {(reading.votesFor !== null || reading.votesAgainst !== null) && (
                      <p>
                        {reading.votesFor ?? 0} for / {reading.votesAgainst ?? 0} against
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Pending</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Fallback: no readings loaded — derive state from currentStatus
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
