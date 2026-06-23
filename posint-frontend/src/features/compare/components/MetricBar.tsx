"use client"

import { Progress } from "@/shared/components/ui/progress"

interface MetricBarValue {
  name: string
  value: number
  color: string
}

interface MetricBarProps {
  label: string
  values: MetricBarValue[]
  max?: number
  format?: (v: number) => string
}

export function MetricBar({ label, values, max, format = String }: MetricBarProps) {
  const maxValue = max ?? Math.max(...values.map((v) => v.value), 1)

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      {values.map((v) => (
        <div key={v.name} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground truncate max-w-[150px]">{v.name}</span>
            <span className="font-medium text-foreground">{format(v.value)}</span>
          </div>
          <Progress
            value={Math.round((v.value / maxValue) * 100)}
            className="h-2"
            style={{ "--progress-color": v.color } as React.CSSProperties}
          />
        </div>
      ))}
    </div>
  )
}
