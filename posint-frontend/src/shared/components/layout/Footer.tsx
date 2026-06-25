import Link from "next/link"
import { Shield, Twitter, Mail, Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-bold text-foreground">POSINT</h3>
                <p className="text-xs text-muted-foreground">Political Intelligence</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Open-source intelligence platform for Nigerian politics.
              Promoting transparency and informed civic engagement.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Twitter className="h-5 w-5 text-muted-foreground" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Github className="h-5 w-5 text-muted-foreground" />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              {[
                { label: "Dashboard", href: "/" },
                { label: "Politicians", href: "/politicians" },
                { label: "Elections", href: "/elections" },
                { label: "Legislature", href: "/legislature" },
                { label: "Anti-Corruption", href: "/anti-corruption" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2">
              {[
                { label: "Data Sources", href: "/about#sources" },
                { label: "Methodology", href: "/about#methodology" },
                { label: "API Access", href: "/about#api" },
                { label: "Research Reports", href: "/about#reports" },
                { label: "Press Kit", href: "/about#press" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              {[
                { label: "Privacy Policy", href: "/legal/privacy" },
                { label: "Terms of Service", href: "/legal/terms" },
                { label: "Disclaimer", href: "/legal/disclaimer" },
                { label: "Contact Us", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} POSINT. Open source political intelligence for Nigeria.
          </p>
          <p className="text-xs text-muted-foreground">
            Data sourced from official government portals and verified civic organizations
          </p>
        </div>
      </div>
    </footer>
  )
}
