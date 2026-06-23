import { Skeleton } from "@/shared/components/ui/skeleton"
export default function Loading() {
  return <div className="container px-4 py-8 space-y-4"><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div><div className="grid md:grid-cols-2 gap-6">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-52" />)}</div></div>
}
