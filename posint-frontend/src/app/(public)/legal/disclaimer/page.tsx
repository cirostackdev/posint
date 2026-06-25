import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Content Disclaimer — POSINT",
  description: "Important disclaimer about data sourcing and accuracy on the POSINT platform.",
}

export default function DisclaimerPage() {
  return (
    <div className="container max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Content Disclaimer</h1>
      <p className="text-muted-foreground mb-8">Last updated: June 2026</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold mb-3">Public Records Only</h2>
          <p className="text-muted-foreground">All data on POSINT is derived exclusively from publicly available official records: government publications, court filings, INEC results, NASS proceedings, EFCC/ICPC press releases, and licensed news media. POSINT does not publish allegations, rumours, or unverified claims.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Presumption of Innocence</h2>
          <p className="text-muted-foreground">The inclusion of any individual in anti-corruption case records reflects the existence of a public legal proceeding, not a finding of guilt. All persons are presumed innocent until proven guilty by a court of competent jurisdiction in the Federal Republic of Nigeria.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Source Attribution</h2>
          <p className="text-muted-foreground">Every data point includes a source link where available. If a source link is unavailable, the data point is marked as &quot;unverified&quot; and should be independently confirmed before reliance.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">No Editorial Bias</h2>
          <p className="text-muted-foreground">POSINT does not endorse, oppose, or editorially comment on any political party, candidate, or officeholder. Data is presented neutrally as reported by the identified official sources.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Data Currency</h2>
          <p className="text-muted-foreground">Records may not reflect the most recent status of ongoing legal proceedings or parliamentary activities. Check the &quot;last updated&quot; timestamp on each record and verify with official sources for time-sensitive decisions.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Corrections</h2>
          <p className="text-muted-foreground">If you believe any information is factually incorrect, submit a <a href="/corrections" className="text-primary hover:underline">Correction Request</a>. All corrections are reviewed within 48 hours and, if verified, applied with a visible changelog.</p>
        </section>
      </div>
    </div>
  )
}
