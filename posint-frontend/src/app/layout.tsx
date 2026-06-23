import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "POSINT — Nigerian Political Intelligence",
    template: "%s — POSINT",
  },
  description:
    "Open-source intelligence on Nigerian politicians, elections, legislation, and anti-corruption efforts.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('posint-theme');if(t){var p=JSON.parse(t);var theme=p?.state?.theme;if(theme==='dark'||((!theme||theme==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
