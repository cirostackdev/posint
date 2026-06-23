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

### Frontend (`posint-frontend`)

| Concern | Technology |
|---------|-----------|
| Framework | Next.js 15 (App Router), React 19, TypeScript 5 |
| Styling | Tailwind CSS 3, shadcn/ui, Radix UI |
| State (server) | TanStack Query 5 |
| State (client) | Zustand 5 |
| API | REST via fetch client → NestJS backend |
| Realtime | Pusher.js |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Testing | Vitest |

### Backend (`posint-backend`)

| Concern | Technology |
|---------|-----------|
| Framework | NestJS 10, TypeScript 5 |
| Database | Neon PostgreSQL (via Prisma 5) |
| Auth | JWT (Passport.js — access + refresh tokens) |
| Cache | Upstash Redis |
| Realtime | Pusher Channels |
| Job Queue | BullMQ |
| Scraping | Cheerio |
| NLP | OpenAI API |
| Testing | Jest |

## Project Structure

```
POSINT/
├── posint-frontend/     # Next.js 15 frontend (feature-based architecture)
└── posint-backend/      # NestJS 10 REST API
```

### Frontend (`src/`)

```
src/
├── app/                 # Next.js App Router (thin route files)
├── features/            # Feature modules (politicians, elections, legislature,
│                        # corruption, parties, compare, social, search, auth, admin)
├── shared/
│   ├── components/      # Layout, shared UI, shadcn/ui primitives
│   ├── config/          # nav.ts, site.ts, parties.ts
│   ├── lib/             # API client, utils, constants
│   └── stores/          # Global Zustand stores (auth, theme)
└── middleware.ts        # Route protection
```

### Backend (`src/`)

```
src/
├── admin/               # Admin management
├── auth/                # JWT auth (signup, login, refresh)
├── politicians/         # Politicians CRUD + queries
├── elections/           # Election results
├── legislature/         # Bill tracking
├── corruption/          # EFCC/ICPC cases
├── parties/             # Political parties
├── social/              # Social media & sentiment
├── compare/             # Comparison aggregations
├── search/              # Full-text search
├── pipeline/            # Data ingestion (BullMQ jobs + scrapers)
├── prisma/              # Prisma service
├── redis/               # Upstash Redis service
├── pusher/              # Pusher realtime service
└── main.ts
```

## Getting Started

### Backend

```bash
cd posint-backend

npm install

cp .env.example .env
# Fill in Neon DATABASE_URL, DIRECT_DATABASE_URL, Redis, Pusher, JWT secrets

npm run db:migrate        # Run Prisma migrations
npm run db:seed           # Seed development data
npm run start:dev         # Start on port 4000
```

### Frontend

```bash
cd posint-frontend

npm install

cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL, NEXT_PUBLIC_PUSHER_KEY, NEXT_PUBLIC_PUSHER_CLUSTER

npm run dev               # Start on port 3000
```

## Environment Variables

### Backend (`.env`)

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# Neon PostgreSQL
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/posint?sslmode=require&pgbouncer=true
DIRECT_DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/posint?sslmode=require

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=
REDIS_HOST=xxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

# Pusher
PUSHER_APP_ID=
NEXT_PUBLIC_PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=

# OpenAI
OPENAI_API_KEY=

# Twitter/X
TWITTER_BEARER_TOKEN=
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=
```

## Development Commands

### Backend

```bash
npm run start:dev        # Dev server (watch mode)
npm run build            # Production build
npm run test             # Jest unit tests
npm run test:e2e         # End-to-end tests
npm run typecheck        # TypeScript check
npm run lint             # ESLint
npm run db:migrate:dev   # Create + run migration
npm run db:studio        # Prisma Studio
```

### Frontend

```bash
npm run dev              # Dev server
npm run build            # Production build
npm run lint             # ESLint
npm run typecheck        # TypeScript check
npm run test             # Vitest
npm run test:watch       # Vitest watch
```

## Design Principles

1. **Data integrity first** — Every data point must have a source. No unsourced claims.
2. **Offline-capable** — Nigerian internet is unreliable. Critical features work offline.
3. **Performance on low-end devices** — Target 3G connections and budget Android phones.
4. **Politically neutral** — Platform presents facts, not opinions. No editorial bias.
5. **Open and auditable** — Data pipelines are transparent. Methodology is documented.

## License

MIT
