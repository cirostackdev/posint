import { Skeleton } from "@/shared/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Skeleton className="h-28 w-full rounded-lg" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
