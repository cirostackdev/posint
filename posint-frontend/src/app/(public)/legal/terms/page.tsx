import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — POSINT",
  description: "Terms governing use of the POSINT political intelligence platform.",
}

export default function TermsPage() {
  return (
    <div className="container max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">Last updated: June 2026</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Platform Purpose</h2>
          <p className="text-muted-foreground">POSINT is a political intelligence platform that aggregates publicly available data about Nigerian politics. All information presented is sourced from official public records, government publications, court documents, and publicly accessible media.</p>
          <p className="text-muted-foreground mt-2">POSINT does not create, fabricate, or editorialize political information. The platform presents facts with source attribution.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Data Sources & Accuracy</h2>
          <p className="text-muted-foreground mb-2">Data on this platform is sourced from:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>National Assembly (NASS) official publications</li>
            <li>Independent National Electoral Commission (INEC) results</li>
            <li>Economic and Financial Crimes Commission (EFCC) press releases</li>
            <li>Independent Corrupt Practices Commission (ICPC) publications</li>
            <li>Code of Conduct Bureau (CCB) public declarations</li>
            <li>Federal courts of record</li>
            <li>Licensed news publications</li>
          </ul>
          <p className="text-muted-foreground mt-3">While we strive for accuracy, users should independently verify information from official sources before relying on it for any purpose. Source links are provided for every data point where available.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Right to Correction</h2>
          <p className="text-muted-foreground">Any individual named on this platform may submit a correction request if they believe information is inaccurate. Correction requests are reviewed within 48 hours. If verified, corrections are published with a timestamp and the original data is preserved in the change history for transparency.</p>
          <p className="text-muted-foreground mt-2">Submit corrections via the <a href="/corrections" className="text-primary hover:underline">Correction Request form</a> or email corrections@posint.ng.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. No Legal Advice</h2>
          <p className="text-muted-foreground">Information on this platform does not constitute legal advice or accusation. Individuals listed in connection with anti-corruption cases are presumed innocent until proven guilty by a court of competent jurisdiction.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. API Usage</h2>
          <p className="text-muted-foreground">API access is governed by the selected tier (Free, Researcher, Institutional). Rate limits apply per tier. Automated bulk scraping of the platform without API access is prohibited.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
          <p className="text-muted-foreground">POSINT is provided &quot;as is&quot; without warranty. We are not liable for decisions made based on information presented on this platform. Users are responsible for independent verification.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Governing Law</h2>
          <p className="text-muted-foreground">These terms are governed by the laws of the Federal Republic of Nigeria.</p>
        </section>
      </div>
    </div>
  )
}
