import { Skeleton } from "@/shared/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container px-4 py-16 space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="flex gap-8">
        <Skeleton className="h-36 w-36 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
