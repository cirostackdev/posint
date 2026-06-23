import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

export default function NotFound() {
  return (
    <div className="container px-4 py-16 text-center">
      <h1 className="text-4xl font-display font-bold text-muted-foreground/20 mb-4">404</h1>
      <h2 className="text-xl font-display font-bold mb-2">Politician Not Found</h2>
      <p className="text-muted-foreground mb-8">
        The politician you&apos;re looking for doesn&apos;t exist in our database.
      </p>
      <Button asChild>
        <Link href="/politicians">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Politicians
        </Link>
      </Button>
    </div>
  )
}
