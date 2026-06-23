import { Skeleton } from "@/shared/components/ui/skeleton"
export default function Loading() {
  return <div className="container px-4 py-8 space-y-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
}
