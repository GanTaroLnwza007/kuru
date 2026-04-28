# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**KUru** is an AI-powered PLO-to-career navigator for Thai Grade 12 (M6) students exploring Kasetsart University programs. It matches students' RIASEC profiles and portfolio to KU programs using a RAG chatbot grounded exclusively in official KU academic documents. All AI responses must include source citations — no hallucination.

Read `specs/context/architecture.md` for the full system design before writing any backend or data-layer code.

## Stack (fixed — do not deviate)

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 App Router, Tailwind CSS v4, shadcn/ui, Zustand, TanStack Query, next-intl |
| Backend | FastAPI (Python), LangChain, Celery + Redis |
| AI | Gemini 2.5 Flash (generation), gemini-embedding-001 (embeddings, dim=768) |
| Database | Supabase (PostgreSQL + pgvector), Neo4j (read-only SkillCluster graph) |

## Repository layout

```
kuru/
├── frontend/          ← Next.js app (all commands run from here)
├── backend/           ← FastAPI app (not yet scaffolded)
├── scripts/           ← offline admin data pipeline
└── specs/
    ├── context/       ← source-of-truth specs (read before acting)
    ├── tasks/         ← atomic task files with acceptance criteria
    └── summary/       ← progress notes, RAGAS eval results
```

## Frontend commands

All commands must be run from the `frontend/` directory.

```bash
npm run dev          # start dev server (http://localhost:3000)
npm run build        # production build
npm run start        # serve production build
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run test         # Vitest unit tests (run once)
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright E2E (requires built + running server)
```

Run a single Vitest test file:
```bash
npx vitest run src/app/__tests__/route-shells.test.tsx
```

Run a single Playwright spec:
```bash
npx playwright test e2e/navigation.spec.ts --project=mobile-375
```

For E2E tests locally, the dev server starts automatically via `webServer` in `playwright.config.ts`. In CI, the app is built and started with `npm run start` before Playwright runs.

## Frontend architecture

### Request / data flow

1. Page (server component) calls `next-intl` for locale/messages → passes to `<Providers>`
2. `<Providers>` wraps the tree with `NextIntlClientProvider` + `QueryClientProvider`
3. Client components call `apiClient.*()` from `src/lib/api/client.ts`
4. `apiClient` validates request/response with Zod schemas from `src/lib/api/schemas.generated.ts`
5. All responses follow the envelope: `{ data, sources, error }`

### Key files

- `src/app/layout.tsx` — root layout; loads Sarabun (`--font-kuru-thai`) and Inter (`--font-kuru-en`) via `next/font`, sets `html[lang]` from `getLocale()`
- `src/app/providers.tsx` — client-side providers (TanStack Query + next-intl); timezone fixed to `Asia/Bangkok`
- `src/lib/api/client.ts` — typed API client; throws `ApiClientError` on envelope errors
- `src/lib/api/schemas.generated.ts` — Zod schemas for all API request/response shapes
- `src/lib/env.ts` — validates `NEXT_PUBLIC_API_BASE_URL` at runtime; throws on missing/invalid value
- `src/lib/cn.ts` — `clsx` + `tailwind-merge` utility
- `src/i18n/routing.ts` — locales: `["th", "en"]`, default `"th"`, prefix `"never"`
- `src/middleware.ts.bak` — next-intl middleware is **disabled** (causes 404s); locale is always served as `"th"` until re-enabled

### i18n

`next-intl` is configured with `localePrefix: "never"` — URLs do not contain a locale prefix. The middleware is currently disabled, so `getLocale()` always returns `"th"`. Message files are at `src/messages/th.json` and `src/messages/en.json`.

### Styling

Tailwind v4. Design tokens (colors, spacing, fonts) are defined as CSS variables in `src/app/globals.css` and referenced in `tailwind.config.ts`. Use the semantic token names (`text-primary`, `surface-muted`, etc.) rather than raw Tailwind colors. Font families: `font-sans` / `font-thai` (Sarabun), `font-en` (Inter).

### API client pattern

```ts
// Always call through apiClient — do not use fetch directly in components
import { apiClient } from "@/lib/api/client";
const data = await apiClient.chat({ message, session_id });
// Throws ApiClientError on failure — catch in TanStack Query's onError
```

## CI workflows

| Workflow | Triggers | What it checks |
|---|---|---|
| `frontend-ci.yml` | push/PR to `main` (frontend paths) | typecheck, ESLint, Vitest, Playwright E2E (mobile-375, Chromium) |
| `code-quality.yml` | push/PR to `main` | frontend typecheck + ESLint; backend Black/Ruff/mypy (when backend exists) |
| `codeql.yml` | push/PR to `main`, weekly | CodeQL for JavaScript/TypeScript |
| `secret-scanning.yml` | push/PR to `main`, daily | Gitleaks CLI scan |

Playwright runs against `--project=mobile-375` only in CI (Chromium, 375 × 812 viewport). The `mobile-375` project uses `devices["Pixel 5"]` (Chromium-based) — not WebKit — to match the installed browser.

## Hard rules (from `specs/context/architecture.md`)

- **All vector columns are `vector(768)`** — gemini-embedding-001 dimension. Never change.
- **Neo4j is read-only at runtime.** Only the offline admin pipeline writes to it.
- **Every chatbot response must include a non-empty `sources[]`.** Return the fallback response if no chunks found — never return an ungrounded answer.
- **All user data writes require a valid Supabase JWT.** RLS must be enabled on every table.
- **KU data only.** Never reference other universities' programs or requirements.

## Git conventions (from `specs/context/git-conventions.md`)

Branch format: `<type>/<frontend|backend>/<short-description>` (under 60 chars, lowercase, hyphens).

```
feat/frontend/program-explorer-card
fix/backend/riasec-tie-breaker
chore/frontend/upgrade-tailwind
```

Commit format: conventional commits, imperative mood, no trailing period, under 72 chars on the summary line. Include the `specs/tasks/` task ID in the body when implementing a planned task.

```
feat(rag): add pgvector similarity search with 0.72 threshold

Implements retriever.py. Returns top-5 chunks above threshold.
See specs/tasks/rag-chatbot.md TASK-002
```

## Environment variables

Copy `frontend/.env.example` to `frontend/.env.local` and set:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

Backend variables (needed when backend is scaffolded): `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, `REDIS_URL`.
