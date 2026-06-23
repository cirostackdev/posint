# POSINT — Nigerian Political Intelligence Platform

Open-source intelligence on Nigerian politicians, elections, legislation, and anti-corruption efforts.

## Overview

POSINT aggregates, analyzes, and presents verifiable data on Nigerian politics — serving journalists, researchers, civil society organizations, and citizens who need transparent access to political information.

### What it tracks

- **Politicians** — Profiles, voting records, asset declarations, party movements, social media footprint
- **Elections** — Results at federal, state, LGA, and ward levels from 2007 to present
- **Legislation** — Bill tracking through the National Assembly pipeline
- **Anti-Corruption** — EFCC/ICPC case monitoring, asset recovery tracking
- **Political Parties** — Seat distribution, defection patterns, internal dynamics
- **Public Sentiment** — Social media analysis, media mentions, approval ratings

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript 5 |
| Styling | Tailwind CSS 4, shadcn/ui, Radix UI |
| State | TanStack Query 5 (server), Zustand 5 (client) |
| API | tRPC 11 (end-to-end type safety) |
| Database | PostgreSQL via Supabase |
| Cache | Upstash Redis |
| Auth | Supabase Auth + Row-Level Security |
| Realtime | Supabase Realtime |
| Pipeline | Inngest (job queue), Playwright (scraping), OpenAI (NLP) |
| Testing | Vitest + Playwright (E2E) |
| Hosting | Vercel |

## Project Structure

```
POSINT/
├── posint-frontend/     # Next.js 15 App Router frontend
├── posint-backend/      # NestJS 10 API (alternative backend)
```

### Frontend architecture (feature-based)

```
src/
├── app/                 # Next.js App Router (thin route files)
├── features/            # Feature modules
│   ├── politicians/     # Profiles, voting records, assets
│   ├── elections/       # Results explorer
│   ├── legislature/     # Bill tracker
│   ├── corruption/      # Anti-corruption case tracker
│   ├── parties/         # Party seat distribution
│   ├── compare/         # Side-by-side politician comparison
│   ├── social/          # Social media & sentiment
│   ├── search/          # Global search
│   ├── auth/            # Authentication
│   └── admin/           # Admin panel
├── shared/              # Cross-feature components, lib, stores
├── server/              # tRPC routers, DB queries
└── pipeline/            # Data ingestion jobs
```

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (PostgreSQL + Auth + Storage + Realtime)
- Upstash Redis instance
- OpenAI API key (for NLP features)

### Frontend

```bash
cd posint-frontend

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local
# Fill in your Supabase, Upstash, and OpenAI credentials

# Run migrations
npm run db:migrate

# Seed development data
npm run db:seed

# Start dev server
npm run dev
```

### Backend (NestJS)

```bash
cd posint-backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Fill in Neon PostgreSQL, Upstash Redis, Pusher credentials

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed

# Start dev server
npm run start:dev
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
PUSHER_APP_ID=
PUSHER_SECRET=
OPENAI_API_KEY=
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
```

## Development

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate Supabase types
npm run db:types
```

## Design Principles

1. **Data integrity first** — Every data point must have a source. No unsourced claims.
2. **Offline-capable** — Nigerian internet is unreliable. Critical features work offline.
3. **Performance on low-end devices** — Target 3G connections and budget Android phones.
4. **Politically neutral** — Platform presents facts, not opinions. No editorial bias.
5. **Open and auditable** — Data pipelines are transparent. Methodology is documented.

## Data Sources

| Source | Frequency | Method |
|--------|-----------|--------|
| NASS (National Assembly) | Daily | Playwright scraper |
| INEC (Election results) | Event-driven | Manual + scraper |
| EFCC/ICPC press releases | 6 hours | RSS + HTML parser |
| Federal Gazette | Weekly | PDF parser |
| Social media (X/Twitter) | 1 hour | API polling |
| News mentions | 2 hours | RSS aggregation |

## License

MIT
