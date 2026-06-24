# CLAUDE.md

## Project Overview

POSINT is a Nigerian Political Open-Source Intelligence platform.

**Monorepo structure:**
- `posint-backend/` — NestJS 10 REST API (Node 22, TypeScript 5)
- `posint-frontend/` — Next.js 15 (App Router, React 19, TypeScript 5)

---

## Backend (`posint-backend/`)

### Stack
- **Framework:** NestJS 10
- **Database:** PostgreSQL via Neon (serverless) — Prisma 6 ORM
- **Cache:** Upstash Redis (HTTP client for caching, ioredis for BullMQ)
- **Queue:** BullMQ (job processing, cron scheduling)
- **Auth:** JWT (Passport.js — access token 15min, refresh token 7d)
- **Real-time:** Pusher Channels
- **NLP:** OpenAI / Anthropic API
- **API Docs:** Swagger at `/api/docs` (dev only)

### Common Commands

```bash
cd posint-backend

npm install               # Install dependencies
npm run start:dev         # Dev server on port 4000 (watch mode)
npm run build             # Production build
npm run test              # Jest unit tests
npm run test:e2e          # End-to-end tests
npx tsc --noEmit          # TypeScript check
npm run lint              # ESLint

npm run db:migrate:dev    # Create + apply new migration
npm run db:migrate:deploy # Apply migrations (production)
npm run db:migrate:status # Check migration status
npm run db:studio         # Prisma Studio UI
npm run db:seed           # Seed development data (NODE_ENV=development only)
```

### Architecture

```
src/
├── admin/           # Admin CRUD + user management
├── auth/            # JWT signup/login/refresh/logout
├── politicians/     # Politicians profiles, voting, assets
├── elections/       # Election results (INEC data)
├── legislature/     # Bill tracking (NASS data)
├── corruption/      # EFCC/ICPC case monitoring
├── parties/         # Political parties
├── compare/         # Side-by-side politician comparison
├── social/          # Social media mentions + sentiment
├── search/          # Full-text search (PostgreSQL FTS)
├── pipeline/        # BullMQ scrapers + processors
├── common/          # Guards, decorators, interceptors, utils
├── config/          # App/DB/Redis/JWT/Pusher/throttle configs
├── prisma/          # PrismaService (global)
├── redis/           # RedisService (global)
└── pusher/          # PusherService (global)
```

### API Pattern

- Base URL: `http://localhost:4000/api/v1`
- All responses: `{ statusCode, message, data, meta? }`
- Auth: `Authorization: Bearer <accessToken>`
- Versioning: URI-based (`/v1/`)
- Rate limiting: 10/sec (global), 5/min login, 3/min signup

### Key Conventions

- All monetary values stored as **bigint in kobo** (1 NGN = 100 kobo)
- Cache keys use deterministic sorted-hash (see `src/common/utils/cache-key.util.ts`)
- Every mutation writes to `audit_log`
- Soft deletes via `isActive = false`
- All mutations trigger Pusher events on `posint-public` channel

---

## Frontend (`posint-frontend/`)

### Stack
- **Framework:** Next.js 15 (App Router), React 19
- **Styling:** Tailwind CSS 3 + shadcn/ui
- **State (server):** TanStack Query 5
- **State (client):** Zustand 5
- **API:** REST via fetch client (`src/shared/lib/api.ts`)
- **Real-time:** Pusher.js
- **Charts:** Recharts (all dynamically imported)
- **Forms:** React Hook Form + Zod
- **Testing:** Vitest

### Common Commands

```bash
cd posint-frontend

npm install               # Install dependencies
npm run dev               # Dev server on port 3000
npm run build             # Production build
npm run lint              # ESLint
npx tsc --noEmit          # TypeScript check
npm test                  # Vitest
```

### Architecture

```
src/
├── app/                  # Next.js App Router (thin route files only)
│   ├── (public)/         # Public pages (no auth required)
│   ├── (auth)/           # Login/signup
│   └── (protected)/      # Admin + dashboard (requires posint-access cookie)
├── features/             # Feature modules
│   ├── politicians/
│   ├── elections/
│   ├── legislature/
│   ├── corruption/
│   ├── parties/
│   ├── compare/
│   ├── social/
│   ├── search/
│   ├── auth/
│   └── admin/
└── shared/
    ├── components/       # Layout, shadcn/ui, shared components
    ├── config/           # nav.ts, site.ts, parties.ts
    ├── lib/              # api.ts (REST client), utils.ts, constants.ts
    └── stores/           # useAuthStore, useThemeStore
```

### Key Conventions

- Route files are **thin** (< 20 lines) — delegate to feature components
- All charts use `dynamic(() => import(...), { ssr: false })`
- Auth tokens stored in localStorage (`posint-auth`) + synced to `posint-access` cookie
- API client (`api.ts`) handles token refresh with mutex (no duplicate refresh calls)
- No `any` types — use `unknown` and narrow
- All monetary values formatted from kobo at display time only

---

## Environment Variables

### Backend `.env`

```
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=...neon.tech...
DIRECT_DATABASE_URL=...neon.tech...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
REDIS_HOST=...
REDIS_PORT=6379
REDIS_PASSWORD=...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
PUSHER_APP_ID=...
NEXT_PUBLIC_PUSHER_KEY=...
PUSHER_SECRET=...
PUSHER_CLUSTER=mt1
ANTHROPIC_API_KEY=sk-ant-...
TWITTER_BEARER_TOKEN=...
```

### Frontend `.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_PUSHER_KEY=...
NEXT_PUBLIC_PUSHER_CLUSTER=mt1
```
