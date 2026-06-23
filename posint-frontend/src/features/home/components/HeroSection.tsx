import Link from "next/link"
import { ArrowRight, Database, Scale, FileSearch, Shield } from "lucide-react"
import { Button } from "@/shared/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-nigeria-gold/10 blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-white/5 blur-[100px]" />

      <div className="container relative px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm animate-fade-in">
            <Shield className="h-4 w-4 text-nigeria-gold" />
            <span className="text-sm font-medium text-white/90">
              Powered by Open Source Intelligence
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Track Nigerian Politics with{' '}
            <span className="text-gradient-gold">Transparency</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Comprehensive intelligence on politicians, elections, legislation, and anti-corruption efforts.
            Make informed decisions about Nigerian governance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button size="lg" className="w-full sm:w-auto bg-nigeria-gold hover:bg-nigeria-gold-dark text-foreground font-semibold px-8 shadow-gold-glow" asChild>
              <Link href="/politicians">
                Explore Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:text-white" asChild>
              <Link href="/politicians">
                View Politicians
              </Link>
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            {[
              { icon: Database, label: '1,469+ Politicians' },
              { icon: FileSearch, label: '342 Active Bills' },
              { icon: Scale, label: '87 Corruption Cases' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
              >
                <item.icon className="h-4 w-4 text-nigeria-gold" />
                <span className="text-sm font-medium text-white/80">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
