# Tasks: MVP Frontend + Backend (KUru Chatbot + Program Explorer)

## Overview

**Deadline:** May 14, 2026 | **Today:** April 26, 2026 | **Working days:** 19

**Your scope:** FastAPI backend scaffold + Program Explorer (backend + frontend) + Chat UI (frontend only, wired to partner's `/chat` endpoint). Auth is **not** required for MVP. Program data arrives from partner — build with seed/mock data first.

**Governed by:** architecture.md, personas.md, `specs/context/rag-guardrails.md`

---

## Milestone Map

```
Apr 26–27  │ M0 │ Design freeze + API contract
Apr 28–30  │ M1 │ Backend foundation + seed data
May 01–05  │ M2 │ Program Explorer (backend + frontend)
May 06–09  │ M3 │ Chat UI (mock-first → real swap)
May 10–13  │ M4 │ Integration, polish, optional deploy
May 14     │ 🎉 │ MVP Demo
```

---

## Milestone 0 — Design Freeze & API Contract
**Apr 26–27 (2 days)**

### TASK-M0-001: Freeze Figma screens for Chat and Program Explorer
**Agent:** frontend-dev
**File(s):** *(Figma — no code file)*
**Spec ref:** `specs/context/architecture.md §4`, `specs/context/personas.md §2`
**Description:** Review the existing Figma file and mark the following screens as **frozen** (no further design changes after Apr 27): Program Explorer search page, Program Explorer result card, Program detail page (including "Chat about this program" button placement), Chat page (message bubble, source citation chip, input bar). Export any redline specs needed for implementation.
**Acceptance criteria:**
- [ ] All 4 screens are marked frozen in Figma with a "FROZEN – Apr 27" label
- [ ] Program detail screen includes a visible "Chat about this program" CTA button
- [ ] Source citation chip design is defined (used in Chat UI)
- [ ] Mobile (375px) and desktop (1280px) frames exist for each screen

**Blocked by:** Nothing

---

### TASK-M0-002: Define OpenAPI contract for `/programs` and `/chat`
**Agent:** backend-dev
**File(s):** `backend/openapi-contract.yaml` *(new file, not the generated one)*
**Spec ref:** `specs/context/architecture.md §5`
**Description:** Write a hand-authored YAML file defining the request/response shapes for the two MVP endpoints. This is the **shared contract** — your frontend and your partner's chatbot both depend on it. Do not implement yet; just define shapes.

Endpoints to define:
```
GET  /api/v1/programs/search?q=&faculty=&limit=
GET  /api/v1/programs/{program_id}
POST /api/v1/chat
```

Response envelope for all three must follow:
```json
{ "data": {}, "sources": [], "error": null }
```

`programs/search` data shape:
```json
{
  "results": [
    {
      "id": "string",
      "name_th": "string",
      "name_en": "string",
      "faculty_th": "string",
      "faculty_en": "string",
      "degree": "string",
      "campus": "Bang Khen",
      "match_score": 0.0,
      "year_by_year_vibe": "string"
    }
  ],
  "total": 0
}
```

`programs/{id}` data shape adds: `plos: [{code, description_th}]`, `tcas_rounds: [{round, quota, min_score}]`

`/chat` request: `{ "message": "string", "program_context_id": "string | null", "session_id": "string | null" }`
`/chat` response data: `{ "answer": "string", "session_id": "string" }`, `sources`: non-empty array of `{table, row_id, excerpt}`

**Acceptance criteria:**
- [ ] YAML file is valid and parseable
- [ ] All three endpoints defined with request + response shapes
- [ ] `program_context_id` field exists in `/chat` request (enables "Chat about this program" pre-seeding)
- [ ] Shared with partner by end of Apr 27

**Blocked by:** Nothing

---

## Milestone 1 — Backend Foundation
**Apr 28–30 (3 days)**

### TASK-M1-001: Scaffold FastAPI project
**Agent:** backend-dev
**File(s):** `backend/main.py`, `backend/pyproject.toml`, `backend/.env.example`, `backend/README.md`
**Spec ref:** `specs/context/architecture.md §2, §6`
**Description:** Initialize the FastAPI app with the following structure:
```
backend/
├── main.py              ← FastAPI app entry, mounts /api/v1 router
├── api/
│   └── v1/
│       ├── router.py    ← aggregates all feature routers
│       ├── programs.py  ← program endpoints
│       └── chat.py      ← chat endpoint (stub/proxy)
├── core/
│   ├── config.py        ← pydantic-settings env loader
│   └── supabase.py      ← supabase client singleton
├── models/
│   └── schemas.py       ← all Pydantic request/response models
└── pyproject.toml       ← black, ruff, dependencies
```
CORS must allow the Next.js dev origin (`http://localhost:3000`). All function signatures must have type hints. Use `pydantic-settings` for env loading.

**Acceptance criteria:**
- [ ] `uvicorn main:app --reload` starts without errors
- [ ] `GET /api/v1/health` returns `{"status": "ok"}`
- [ ] CORS allows `http://localhost:3000`
- [ ] `.env.example` mirrors `architecture.md §6` variables
- [ ] `black` and `ruff` pass with zero issues

**Blocked by:** Nothing

---

### TASK-M1-002: Define Pydantic schemas for all MVP endpoints
**Agent:** backend-dev
**File(s):** `backend/models/schemas.py`
**Spec ref:** `specs/context/architecture.md §5`, `TASK-M0-002`
**Description:** Translate the OpenAPI contract from TASK-M0-002 into Pydantic v2 models. Every request body and response body must be a typed Pydantic model. Include the `ApiResponse[T]` generic envelope:
```python
class ApiResponse(BaseModel, Generic[T]):
    data: T
    sources: list[SourceChunk]
    error: str | None = None

class SourceChunk(BaseModel):
    table: str
    row_id: str
    excerpt: str
```

**Acceptance criteria:**
- [ ] `ApiResponse`, `SourceChunk`, `ProgramSummary`, `ProgramDetail`, `PloItem`, `TcasRound`, `ChatRequest`, `ChatResponse` all defined
- [ ] All fields have type hints and `Field(description=...)` annotations
- [ ] `mypy` or `pyright` passes with zero errors on this file

**Blocked by:** TASK-M1-001

---

### TASK-M1-003: Create Supabase `programs` table migration + seed script
**Agent:** backend-dev
**File(s):** `scripts/migrations/001_programs.sql`, `scripts/seed_programs.py`
**Spec ref:** `specs/context/architecture.md §3 (Supabase)`, `TASK-M0-002`
**Description:** Write a SQL migration that creates the `programs` table matching the contract schema. Then write a Python seed script that inserts **10 representative stub programs** (Bang Khen campus only) so the frontend can be built without waiting for the partner's full 50-program ingest.

Table DDL (minimum):
```sql
CREATE TABLE programs (
  id            TEXT PRIMARY KEY,
  name_th       TEXT NOT NULL,
  name_en       TEXT NOT NULL,
  faculty_th    TEXT NOT NULL,
  faculty_en    TEXT NOT NULL,
  degree        TEXT NOT NULL DEFAULT 'ปริญญาตรี',
  campus        TEXT NOT NULL DEFAULT 'Bang Khen',
  year_by_year_vibe TEXT,
  embedding     vector(768),
  created_at    TIMESTAMPTZ DEFAULT now()
);
```
Seed 10 programs spanning at least 5 different faculties. `year_by_year_vibe` can be a 1–2 sentence Thai stub string. `embedding` can be NULL in seed data.

**Acceptance criteria:**
- [ ] Migration runs cleanly on a fresh Supabase project
- [ ] Seed script inserts 10 programs without errors
- [ ] All 10 programs have `campus = 'Bang Khen'`
- [ ] `year_by_year_vibe` is non-null for all 10 seed rows
- [ ] Script is idempotent (safe to run twice)

**Blocked by:** TASK-M1-001

---

### TASK-M1-004: Implement `GET /api/v1/programs/search` endpoint
**Agent:** backend-dev
**File(s):** `backend/api/v1/programs.py`
**Spec ref:** `specs/context/architecture.md §4 (Program Explorer)`
**Description:** Implement the search endpoint. For MVP, use **text search** (PostgreSQL `ILIKE`) rather than pgvector — the embedding pipeline is your partner's work and may not be ready. When embeddings are available, this endpoint can be upgraded to pgvector without changing the response shape.

Query logic:
```python
# MVP: text match on name_th, name_en, faculty_th
SELECT * FROM programs
WHERE campus = 'Bang Khen'
  AND (name_th ILIKE %q% OR name_en ILIKE %q% OR faculty_th ILIKE %q%)
LIMIT :limit
```
If `q` is empty, return all programs ordered by `name_th`. Set `match_score = 1.0` for all results in MVP (placeholder). `sources` array must contain `[{"table": "programs", "row_id": "*", "excerpt": "text search over programs table"}]`.

**Acceptance criteria:**
- [ ] `GET /api/v1/programs/search?q=วิศว` returns matching programs
- [ ] `GET /api/v1/programs/search` (no query) returns all programs
- [ ] Response matches `ApiResponse[ProgramSearchResult]` shape exactly
- [ ] `sources` array is non-empty
- [ ] `faculty=` filter param works when provided

**Blocked by:** TASK-M1-002, TASK-M1-003

---

### TASK-M1-005: Implement `GET /api/v1/programs/{program_id}` endpoint
**Agent:** backend-dev
**File(s):** `backend/api/v1/programs.py`
**Spec ref:** `specs/context/architecture.md §4`
**Description:** Fetch a single program by ID. For MVP, PLOs and TCAS rounds can be stub data returned as hardcoded JSON per program ID (since the `plos` and `tcas_requirements` tables may not be seeded yet). Add a `# TODO: replace with Supabase join` comment. Return 404 with `error` field set if program not found.

**Acceptance criteria:**
- [ ] `GET /api/v1/programs/ske` returns full `ProgramDetail` shape
- [ ] 404 returns `{"data": null, "sources": [], "error": "Program not found"}`
- [ ] `plos` list has at least 2 stub items per program
- [ ] `tcas_rounds` list has at least 1 stub item per program

**Blocked by:** TASK-M1-002, TASK-M1-003

---

### TASK-M1-006: Implement `/api/v1/chat` stub + mock response
**Agent:** backend-dev
**File(s):** `backend/api/v1/chat.py`
**Spec ref:** `specs/context/architecture.md §4 (RAG Chatbot)`, `specs/context/architecture.md §5`
**Description:** Implement a **mock chat endpoint** that returns a realistic-looking response without calling Gemini. This unblocks Chat UI development while your partner builds the real RAG pipeline. The mock must return the exact same envelope shape as the real endpoint will.

Mock logic:
```python
# If program_context_id is set, prefix the answer with program name
# Return a canned Thai answer + 2 fake sources
# Generate a UUID session_id if none provided
```

Include a `X-Mock-Response: true` header so the frontend can show a "⚠️ Demo mode" badge during testing.

**Acceptance criteria:**
- [ ] `POST /api/v1/chat` with any message returns HTTP 200
- [ ] Response has non-empty `sources[]` with at least 2 items
- [ ] `session_id` is returned and is a valid UUID
- [ ] `program_context_id` in request causes the answer to mention the program name
- [ ] `X-Mock-Response: true` header present on all responses from this stub

**Blocked by:** TASK-M1-002

---

## Milestone 2 — Program Explorer (Frontend + Backend wired)
**May 1–5 (5 days)**

### TASK-M2-001: Update Zod schemas for programs API
**Agent:** frontend-dev
**File(s):** schemas.generated.ts
**Spec ref:** `specs/context/architecture.md §5`, `TASK-M0-002`
**Description:** Replace the existing stub schemas for the programs endpoints with Zod schemas that exactly match the OpenAPI contract from TASK-M0-002. Export `ProgramSummarySchema`, `ProgramDetailSchema`, `ProgramSearchResponseSchema`.

**Acceptance criteria:**
- [ ] All schemas parse a valid API response without throwing
- [ ] `z.infer<typeof ProgramDetailSchema>` is used as the TypeScript type (no `any`)
- [ ] `npm run typecheck` passes

**Blocked by:** TASK-M0-002

---

### TASK-M2-002: Program Explorer search page — search bar + result list
**Agent:** frontend-dev
**File(s):** `frontend/src/app/(explore)/page.tsx`, `frontend/src/components/explore/ProgramSearchBar.tsx`, `frontend/src/components/explore/ProgramCard.tsx`
**Spec ref:** `specs/context/architecture.md §4`, `specs/context/personas.md §2 Persona B`
**Description:** Replace the existing route shell with a real, functional search page. The page is a **client component** (search is interactive). On mount, fetch all programs (`q=""`). On input change (debounced 300ms), re-fetch with the query string. Display results as `ProgramCard` components.

`ProgramCard` must show: program name (Thai), faculty name (Thai), degree, a truncated `year_by_year_vibe` (1 line, `line-clamp-1`), and a "ดูรายละเอียด →" link to `/explore/{id}`. Cards must be touch-friendly (min 44px tap target, full card is clickable).

**Acceptance criteria:**
- [ ] Page loads and shows all programs on first render (no query)
- [ ] Typing in search bar filters results within 300ms debounce
- [ ] Empty state shows "ไม่พบโปรแกรมที่ตรงกัน" message
- [ ] Each card links to `/explore/{id}`
- [ ] Works at 375px width without horizontal overflow
- [ ] `npm run typecheck` and `npm run lint` pass

**Blocked by:** TASK-M2-001, TASK-M1-004

---

### TASK-M2-003: Program detail page — full detail view
**Agent:** frontend-dev
**File(s):** `frontend/src/app/(explore)/[programId]/page.tsx`, `frontend/src/components/explore/PloList.tsx`, `frontend/src/components/explore/TcasRoundsTable.tsx`, `frontend/src/components/explore/ChatAboutButton.tsx`
**Spec ref:** `specs/context/architecture.md §4`, `specs/context/personas.md §2 Persona B`
**Description:** Replace the existing route shell with a real detail page. This is a **server component** (static fetch by ID). Sections in order:

1. **Header:** Program name (Thai + English), faculty, degree badge
2. **Year-by-year vibe:** A highlighted callout box (`bg-surface-subtle rounded-2xl p-4`) showing `year_by_year_vibe` text
3. **PLOs:** `<PloList>` — a numbered list of PLO descriptions
4. **TCAS Rounds:** `<TcasRoundsTable>` — a simple table with round name, quota, min score
5. **"Chat about this program" CTA:** `<ChatAboutButton programId={id} programName={name_th} />` — a client component that navigates to `/chat?program_id={id}&program_name={encodedName}`. Button text: `"💬 ถามเกี่ยวกับ{name_th}"`

**Acceptance criteria:**
- [ ] All 5 sections render with real data from the API
- [ ] `year_by_year_vibe` callout box is visually distinct
- [ ] `ChatAboutButton` navigates to `/chat` with correct query params
- [ ] 404 from API renders a "ไม่พบโปรแกรมนี้" error state (not a crash)
- [ ] `npm run typecheck` and `npm run lint` pass

**Blocked by:** TASK-M2-001, TASK-M1-005

---

### TASK-M2-004: Add i18n strings for Program Explorer
**Agent:** frontend-dev
**File(s):** th.json, en.json
**Spec ref:** `specs/context/personas.md §3`
**Description:** Add a new `explore` namespace to both locale files covering: search placeholder, empty state, card CTA, detail section headings (PLOs, TCAS, vibe), and the chat button label.

**Acceptance criteria:**
- [ ] `explore` namespace present in both `th.json` and `en.json`
- [ ] No hardcoded Thai strings remain in explore components
- [ ] `npm run typecheck` passes (next-intl catalog check)

**Blocked by:** TASK-M2-002, TASK-M2-003

---

### TASK-M2-005: E2E tests for Program Explorer
**Agent:** qa
**File(s):** `frontend/e2e/explore.spec.ts`
**Spec ref:** `specs/context/personas.md §1` (375px baseline)
**Description:** Write Playwright E2E tests covering: search returns results, empty state on no match, card click navigates to detail, detail page shows all 5 sections, "Chat about this program" button navigates to `/chat` with correct params. Run against the mock backend (TASK-M1-004, TASK-M1-005).

**Acceptance criteria:**
- [ ] At least 8 test cases
- [ ] Tests run at 375px and 1280px viewports
- [ ] All tests pass against the seed data
- [ ] `npx playwright test explore` exits 0

**Blocked by:** TASK-M2-002, TASK-M2-003

---

## Milestone 3 — Chat UI (Mock-first → Real swap)
**May 6–9 (4 days)**

### TASK-M3-001: Update Zod schemas for chat API
**Agent:** frontend-dev
**File(s):** schemas.generated.ts
**Spec ref:** `specs/context/architecture.md §5`, `TASK-M0-002`
**Description:** Add `ChatRequestSchema` and `ChatResponseSchema` Zod schemas matching the contract. Export inferred TypeScript types.

**Acceptance criteria:**
- [ ] Schemas parse a valid mock response without throwing
- [ ] `session_id`, `answer`, `sources` all typed correctly
- [ ] `npm run typecheck` passes

**Blocked by:** TASK-M0-002

---

### TASK-M3-002: Chat page — message list + input bar
**Agent:** frontend-dev
**File(s):** `frontend/src/app/(chat)/page.tsx`, `frontend/src/components/chat/MessageList.tsx`, `frontend/src/components/chat/MessageBubble.tsx`, `frontend/src/components/chat/ChatInput.tsx`
**Spec ref:** `specs/context/architecture.md §4 (RAG Chatbot)`, `specs/context/personas.md §2 Persona A, E`
**Description:** Replace the existing chat route shell with a functional chat page. This is a **client component** (interactive). Read `program_id` and `program_name` from URL search params — if present, show a context banner: `"💬 กำลังถามเกี่ยวกับ {program_name}"` and pre-seed the first message as `"ช่วยแนะนำโปรแกรม {program_name} ให้หน่อยได้ไหม"` (sent automatically on mount).

`MessageBubble` variants: `user` (right-aligned, `bg-primary text-white`) and `assistant` (left-aligned, `bg-surface-subtle`). Each assistant bubble must render `SourceCitationList` below the answer text.

`ChatInput`: a `<textarea>` that submits on Enter (Shift+Enter = newline). Disable input while a response is loading. Show a typing indicator (3 animated dots) while waiting.

Zustand store slice (`chatSlice`): `messages[]`, `sessionId`, `isLoading`. Wire to the API client calling `POST /api/v1/chat`.

**Acceptance criteria:**
- [ ] Sending a message appends a user bubble immediately
- [ ] Typing indicator appears while waiting for response
- [ ] Assistant bubble appears with answer text + source citations
- [ ] `program_id` in URL causes context banner + auto-sent first message
- [ ] `X-Mock-Response: true` header causes a `"⚠️ โหมดทดสอบ"` badge to appear on the assistant bubble
- [ ] Works at 375px (input bar pinned to bottom, messages scroll above)
- [ ] `npm run typecheck` and `npm run lint` pass

**Blocked by:** TASK-M3-001, TASK-M1-006

---

### TASK-M3-003: Source citation component
**Agent:** frontend-dev
**File(s):** `frontend/src/components/chat/SourceCitationList.tsx`, `frontend/src/components/chat/SourceChip.tsx`
**Spec ref:** `specs/context/architecture.md §5` (sources[] required on every response)
**Description:** `SourceCitationList` renders a horizontal scrollable row of `SourceChip` components below each assistant message. Each chip shows: a table icon, the `table` name, and a truncated `excerpt` (max 40 chars). Chips are non-interactive for MVP (no expand/modal). If `sources` is empty, render nothing (the backend should never send empty sources, but guard defensively).

**Acceptance criteria:**
- [ ] Chips render for every assistant message that has sources
- [ ] Empty `sources[]` renders nothing (no crash)
- [ ] Chips are horizontally scrollable on 375px without clipping
- [ ] `npm run typecheck` and `npm run lint` pass

**Blocked by:** TASK-M3-002

---

### TASK-M3-004: Add i18n strings for Chat page
**Agent:** frontend-dev
**File(s):** th.json, en.json
**Spec ref:** `specs/context/personas.md §3`
**Description:** Add a `chat` namespace: input placeholder, context banner template, typing indicator label, mock mode badge, empty state, error state.

**Acceptance criteria:**
- [ ] `chat` namespace present in both locale files
- [ ] No hardcoded Thai strings in chat components
- [ ] `npm run typecheck` passes

**Blocked by:** TASK-M3-002

---

### TASK-M3-005: Real `/chat` endpoint swap (coordinate with partner)
**Agent:** frontend-dev + backend-dev
**File(s):** `backend/api/v1/chat.py`, client.ts
**Spec ref:** `specs/context/architecture.md §4`
**Description:** When your partner's RAG endpoint is ready, swap the mock in `chat.py` to proxy to the real RAG pipeline. The frontend requires **zero changes** if the response shape matches the contract (TASK-M0-002). Verify by removing the `X-Mock-Response` header and confirming the "⚠️ โหมดทดสอบ" badge disappears.

**Acceptance criteria:**
- [ ] Real responses arrive from Gemini with non-empty `sources[]`
- [ ] `X-Mock-Response` header is absent
- [ ] Mock badge no longer appears in the UI
- [ ] Session continuity works (same `session_id` across messages)

**Blocked by:** Partner's RAG endpoint being ready ⚠️ **COORDINATE WITH PARTNER**

---

### TASK-M3-006: E2E tests for Chat page
**Agent:** qa
**File(s):** `frontend/e2e/chat.spec.ts`
**Spec ref:** `specs/context/personas.md §1`
**Description:** Playwright E2E tests covering: send message → bubble appears, typing indicator → response appears, source chips render, context banner appears when `program_id` param is set, auto-sent first message when arriving from Program Explorer.

**Acceptance criteria:**
- [ ] At least 6 test cases
- [ ] Tests run against mock backend (TASK-M1-006)
- [ ] 375px and 1280px viewports covered
- [ ] `npx playwright test chat` exits 0

**Blocked by:** TASK-M3-002, TASK-M3-003

---

## Milestone 4 — Integration, Polish & Optional Deploy
**May 10–13 (4 days)**

### TASK-M4-001: Cross-feature integration smoke test
**Agent:** qa
**File(s):** `frontend/e2e/integration.spec.ts`
**Spec ref:** `specs/context/personas.md §2 Persona B`
**Description:** Write a single end-to-end user journey test: Landing page → search for a program → click card → view detail → click "Chat about this program" → verify chat opens with context banner and auto-sent message. This is the **primary demo flow**.

**Acceptance criteria:**
- [ ] Full journey completes without errors at 375px
- [ ] Full journey completes without errors at 1280px
- [ ] Test is tagged `@smoke` and runs in < 30 seconds

**Blocked by:** TASK-M2-005, TASK-M3-006

---

### TASK-M4-002: Loading skeletons and error boundaries
**Agent:** frontend-dev
**File(s):** `frontend/src/app/(explore)/loading.tsx`, `frontend/src/app/(explore)/error.tsx`, `frontend/src/app/(chat)/error.tsx`
**Spec ref:** `specs/context/personas.md §2 Persona E` (fast perceived response)
**Description:** Add Next.js `loading.tsx` skeleton screens for the explore route (card grid skeleton, 4 placeholder cards). Add `error.tsx` boundaries for both explore and chat routes showing a friendly Thai error message with a retry button.

**Acceptance criteria:**
- [ ] Skeleton renders during data fetch (visible on slow network throttle in DevTools)
- [ ] Error boundary catches API failures and shows "เกิดข้อผิดพลาด กรุณาลองใหม่" with retry
- [ ] No unhandled promise rejections in console

**Blocked by:** TASK-M2-002, TASK-M3-002

---

### TASK-M4-003: (Optional) Deploy frontend to Vercel + backend to Railway
**Agent:** backend-dev + frontend-dev
**File(s):** `frontend/vercel.json`, `backend/railway.toml`, `.github/workflows/deploy.yml`
**Spec ref:** `specs/context/architecture.md §9`
**Description:** Deploy if time allows. Frontend to Vercel (connect GitHub repo, set `NEXT_PUBLIC_API_BASE_URL` to Railway URL). Backend to Railway (Dockerfile or nixpacks). Set all env vars from `architecture.md §6`. Verify the smoke test journey works on the live URL.

**Acceptance criteria:**
- [ ] `https://{project}.vercel.app` loads the landing page
- [ ] Program Explorer search works against the deployed backend
- [ ] Chat works (mock mode is acceptable for demo if partner's endpoint isn't deployed)
- [ ] No secrets committed to the repository

**Blocked by:** TASK-M4-001 *(deploy only after smoke test passes)*

---

## Dependency Graph (critical path)

```
M0-001 ──────────────────────────────────────────────────────► M2-002
M0-002 ──► M1-002 ──► M1-004 ──► M2-002 ──► M2-005 ──► M4-001 ──► M4-003
                  └──► M1-005 ──► M2-003 ──┘
                  └──► M1-006 ──► M3-002 ──► M3-003 ──► M3-006 ──┘
M1-001 ──► M1-002 (all backend tasks depend on scaffold)
M1-003 ──► M1-004, M1-005 (seed data must exist before endpoints)
```

**Critical path:** M0-002 → M1-001 → M1-002 → M1-003 → M1-004 → M2-002 → M4-001

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Partner's `/chat` endpoint not ready by May 6 | High | Medium | Mock endpoint (TASK-M1-006) unblocks Chat UI entirely |
| Partner's 50-program data not ready by May 1 | High | Low | 10-program seed data (TASK-M1-003) is sufficient for demo |
| `year_by_year_vibe` field not populated in partner's ingest | Medium | Low | Seed data has stub values; field is optional in UI |
| Middleware locale routing breaks E2E (known issue from progress.md) | Low | Low | Already mitigated — middleware disabled for MVP |

---

This plan should be saved to `specs/tasks/mvp-frontend-backend.md`. Would you like me to produce the exact file content to paste in, or do you have any adjustments to the scope or dates before I finalize it?