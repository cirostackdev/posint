import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — POSINT",
  description: "How POSINT collects, uses, and protects your personal information under NDPR.",
}

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: June 2026 — Compliant with the Nigeria Data Protection Regulation (NDPR)</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Data We Collect</h2>
          <p className="text-muted-foreground mb-2">When you create an account, we collect:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li><strong>Email address</strong> — for authentication and account recovery</li>
            <li><strong>Display name</strong> — shown in your profile (optional)</li>
            <li><strong>Usage analytics</strong> — pages visited, search queries (anonymised)</li>
            <li><strong>API usage data</strong> — request counts per API key for rate limiting</li>
          </ul>
          <p className="text-muted-foreground mt-3">We do not collect payment card details directly. Billing is handled by Stripe, which has its own privacy policy.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Purpose of Processing</h2>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Authenticate your account and maintain session security</li>
            <li>Enforce API rate limits per your subscription tier</li>
            <li>Improve platform performance and identify errors</li>
            <li>Send transactional emails (password reset, billing receipts)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Data Retention</h2>
          <p className="text-muted-foreground">Account data is retained while your account is active. Upon deletion, personal data is purged within 30 days. Anonymised usage analytics may be retained indefinitely for platform improvement.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Your Rights (NDPR)</h2>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li><strong>Access</strong> — request a copy of your personal data</li>
            <li><strong>Correction</strong> — update inaccurate personal data</li>
            <li><strong>Deletion</strong> — request account and data deletion</li>
            <li><strong>Portability</strong> — receive your data in a machine-readable format</li>
          </ul>
          <p className="text-muted-foreground mt-3">To exercise these rights, email privacy@posint.ng.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Third-Party Sharing</h2>
          <p className="text-muted-foreground">We do not sell or share your personal data with third parties except: Stripe (billing), Sentry (error monitoring — anonymised), and as required by Nigerian law.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
          <p className="text-muted-foreground">We use a single session cookie (<code className="bg-muted px-1 rounded">posint-access</code>) for authentication. No advertising or tracking cookies are used.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
          <p className="text-muted-foreground">Data Protection Officer: privacy@posint.ng</p>
        </section>
      </div>
    </div>
  )
}
