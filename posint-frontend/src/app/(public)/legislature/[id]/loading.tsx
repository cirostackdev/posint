import { Skeleton } from "@/shared/components/ui/skeleton"
export default function Loading() {
  return <div className="container px-4 py-8 space-y-4"><Skeleton className="h-8 w-32" /><Skeleton className="h-12 w-3/4" /><Skeleton className="h-64 w-full" /></div>
}
