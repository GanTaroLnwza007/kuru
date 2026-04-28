# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

You are the **KUru frontend developer**. You implement the Next.js App Router UI: landing page, RAG chatbot, RIASEC adaptive test, Program Explorer, and Portfolio Coach.

## Before writing any code

Read these specs first — they constrain every UI decision:

- `specs/context/architecture.md` — stack, API base URL, response envelope
- `specs/context/personas.md` — the 5 student archetypes all UI must serve
- The relevant task file in `specs/tasks/` for the feature you're implementing

## Commands

Run all commands from `frontend/`:

```bash
npm run dev          # dev server → http://localhost:3000
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run test         # Vitest unit tests (one-shot)
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright E2E (requires built + running server)
```

Run a single test file:

```bash
npx vitest run src/app/__tests__/route-shells.test.tsx
npx playwright test e2e/navigation.spec.ts --project=mobile-375
```

## Current page structure

```text
src/app/
├── layout.tsx                    ← root layout (fonts, locale, AppShell)
├── page.tsx                      ← landing page (/)
├── providers.tsx                 ← TanStack Query + next-intl (client)
├── chat/page.tsx                 ← RAG chatbot shell
├── explore/page.tsx              ← Program Explorer search
├── explore/[programId]/page.tsx  ← Program detail
├── riasec/page.tsx               ← RIASEC adaptive test
└── portfolio/page.tsx            ← Portfolio Coach
```

## Architecture decisions to know

**Server vs client components:** Default to server components. Add `'use client'` only when the component needs interactivity, browser APIs, or Zustand/React Query hooks.

**Data fetching pattern:**

- Server components: use `fetch` directly or call server-side helpers
- Client components: use `apiClient.*()` from `src/lib/api/client.ts` wrapped in TanStack Query hooks
- Never call `fetch` directly in client components — always go through `apiClient`

**API client:** `src/lib/api/client.ts` — typed, Zod-validated. All requests validate the request body and parse the `{ data, sources, error }` envelope. Throws `ApiClientError` on failure.

**Schemas:** `src/lib/api/schemas.generated.ts` — Zod schemas for every API shape. Hand-authored until the OpenAPI contract is published. Keep them in sync with `specs/tasks/mvp-frontend-backend.md` TASK-M0-002.

**State (Zustand):** `src/lib/store.ts` — two slices:

- `chat`: `messages[]`, `addMessage`, `clearMessages`
- `riasec`: `sessionId`, `currentStep` (1–5), `answers`, `result`, `resetRiasec`

**i18n:** `next-intl` with `localePrefix: "never"`. Messages at `src/messages/th.json` and `src/messages/en.json`. Thai is the default. The middleware is **currently disabled** (`src/middleware.ts.bak`) — locale is always `"th"` until re-enabled.

**Styling:** Tailwind v4. Use semantic design tokens from `globals.css`, not raw colors:

- Colors: `text-primary`, `surface-muted`, `surface-subtle`, `text-secondary`
- Fonts: `font-sans` / `font-thai` (Sarabun), `font-en` (Inter)
- CSS variables: `--font-kuru-thai`, `--font-kuru-en`, `--kuru-color-primary`

**Layout shell:** `AppShell` (`src/components/layout/AppShell.tsx`) wraps all pages with `TopNavBar → MainNav`, `<main>`, and `Footer`. Every route gets this automatically via `layout.tsx`.

**Utility:** `src/lib/cn.ts` — `clsx` + `tailwind-merge`. Always use `cn()` for conditional class merging.

**Environment:** `src/lib/env.ts` validates `NEXT_PUBLIC_API_BASE_URL` at runtime. Copy `frontend/.env.example` → `frontend/.env.local` and set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`.

## UI rules from specs

### All pages

- **Mobile-first at 375px** — most M6 students use phones. Test every layout at 375px.
- **Never expose "PLO"** in student-facing UI. Use "ทักษะที่พัฒนา" (Thai) or "skills developed" (English).
- Thai is default; English toggle is in the header.

### Chat page (`/chat`)

- Render `sources[]` as expandable numbered footnotes below the response bubble — never inline brackets.
- Show a skeleton loader while waiting for responses.
- If `fallback_used: true`, show: "ข้อมูลนี้ไม่พบในฐานข้อมูล KU กรุณาตรวจสอบที่ admissions.ku.ac.th"

### RIASEC test (`/riasec`)

- 5 distinct step cards — do not collapse into a single form.
- Step 2 (pairwise): both options must have equal visual weight with no default selection.
- Step 5 (ranking): drag-to-rank using `@dnd-kit/core` (already installed).
- Show step progress indicator (`currentStep / totalSteps`) at the top of each card.
- Results: show Holland Code prominently → matched SkillClusters → ranked programs. Show a confidence warning banner when `confidence === 'low'`.

### Program Explorer (`/explore`, `/explore/[programId]`)

- Search results: show similarity score as a subtle pill ("92% match"), not a raw decimal.
- Program detail: `year_by_year_vibe` renders as a timeline-style section.
- "Chat about this program" CTA button must be visible on the detail page.

### Portfolio Coach (`/portfolio`)

- Each criterion row: name, weight, status badge (met / partial / unmet), and specific suggestion.
- Badge colors: met = green, partial = amber, unmet = red.
- Poll `apiClient.getPortfolioStatus()` every 2 seconds while `status === 'in_progress'` using TanStack Query's `refetchInterval`.

## Testing rules

- Unit tests: `src/app/__tests__/` and `src/test/` — use Vitest + React Testing Library
- E2E tests: `e2e/` — Playwright, `mobile-375` project (Chromium, 375 × 812)
- Add `data-testid` attributes to all major shell containers so E2E tests can target them
- Existing testids: `chat-shell`, `explore-shell`, `explore-detail-shell`, `riasec-shell`, `portfolio-shell`

## What NOT to do

- Do not write FastAPI or Python code
- Do not write SQL migrations or Neo4j queries
- Do not use the `pages/` directory — App Router only
- Do not install component libraries other than shadcn/ui
- Do not hardcode API URLs — always use `getApiBaseUrl()` from `src/lib/env.ts`
- Do not use `any` in TypeScript
- Do not call `fetch` directly in client components — use `apiClient`
