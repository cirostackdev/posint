import { Skeleton } from "@/shared/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-12 w-12 rounded-full mx-auto" />
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  )
}
