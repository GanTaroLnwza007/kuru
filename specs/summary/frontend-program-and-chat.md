# Frontend: Program Explorer & Chat UI

**Branch:** `feat/frontend/program-and-chat`
**Date:** 2026-05-03
**Milestones covered:** M2 (Program Explorer) + M3 (Chat UI)

---

## Approach

All components were built **mock-first**: a `NEXT_PUBLIC_USE_MOCK=true` env flag swaps the real API client for an in-code mock, so the full UI runs without a backend connection. Switching to the real FastAPI backend requires only setting `NEXT_PUBLIC_USE_MOCK=false` in `.env.local` — no component changes needed.

---

## Files Changed (22)

### New files

| File | Purpose |
|------|---------|
| `frontend/src/lib/api/index.ts` | Unified `apiClient` export — picks mock or real client based on env flag; normalises both to `{ data, sources, isMock }` |
| `frontend/src/lib/api/mock-data.ts` | 10 KU Bang Khen programs (5 faculties) with full PLOs, TCAS rounds, year-by-year vibe |
| `frontend/src/lib/api/mock-client.ts` | Same interface as real client; 350ms simulated delay; context-aware canned Thai answers |
| `frontend/src/components/explore/ProgramSearchBar.tsx` | Controlled search input with 300ms debounce |
| `frontend/src/components/explore/ProgramCard.tsx` | Full-card link, `line-clamp-1` vibe, 44px min tap target |
| `frontend/src/components/explore/PloList.tsx` | Numbered list of PLO `{code, description_th}` items |
| `frontend/src/components/explore/TcasRoundsCards.tsx` | 4-column card grid for TCAS rounds (name, quota, min score) |
| `frontend/src/components/explore/ChatAboutButton.tsx` | Navigates to `/chat?program_id=…&program_name=…` |
| `frontend/src/components/chat/MessageBubble.tsx` | User (right, green) / assistant (left, surface) bubble variants; mock badge |
| `frontend/src/components/chat/MessageList.tsx` | Scrollable list with auto-scroll to bottom and animated 3-dot typing indicator |
| `frontend/src/components/chat/SourceChip.tsx` | Table icon + truncated (40 char) excerpt chip |
| `frontend/src/components/chat/SourceCitationList.tsx` | Horizontally scrollable row of `SourceChip` below each assistant message |
| `frontend/src/components/chat/ChatInput.tsx` | Auto-grow textarea; Enter = send, Shift+Enter = newline; disabled while loading |

### Modified files

| File | What changed |
|------|-------------|
| `frontend/src/lib/api/schemas.generated.ts` | Replaced all schemas with M1 contract shapes: `name_th/en`, `faculty_th/en`, `degree`, `campus`, `match_score`, `year_by_year_vibe`, `plos[]`, `tcas_rounds[]`, `session_id`, `sources[]` |
| `frontend/src/lib/api/client.ts` | Fixed search from POST → GET with query params; updated to M1 types; removed old schemas |
| `frontend/src/lib/env.ts` | Added `isUsingMock()` helper; `getApiBaseUrl()` gracefully skips validation in mock mode |
| `frontend/src/lib/store.ts` | Chat slice: added `sessionId`, `isLoading`, `setSessionId`, `setLoading`; `ChatMessage` gains `sources?` and `isMock?` |
| `frontend/src/app/explore/page.tsx` | Full client component: fetch-on-mount, debounced re-fetch, loading skeleton grid, empty state |
| `frontend/src/app/explore/[programId]/page.tsx` | Full server component: 5 sections — hero header, year-by-year vibe callout, PLO list, TCAS cards, Chat CTA |
| `frontend/src/app/chat/page.tsx` | Full client component: reads `program_id`/`program_name` URL params, context banner, auto-sends first message, mock badge |
| `frontend/src/messages/th.json` | Added `explore` and `chat` namespace strings; no hardcoded Thai in components |
| `frontend/src/messages/en.json` | Same namespace additions in English |

---

## Architecture decisions

**Unified `ClientResponse<T>` type**
Both the mock and real clients return `{ data: T, sources: SourceChunk[], isMock: boolean }`. This means page components are identical whether mock or real data is in use — the only branching happens inside `api/index.ts`.

**Mock-first env flag**
`.env.local` ships with `NEXT_PUBLIC_USE_MOCK=true`. When the backend is ready, the developer sets it to `false` and points `NEXT_PUBLIC_API_BASE_URL` at the FastAPI server. No component code changes.

**Server vs client component split**
- `/explore/page.tsx` — **client component** (interactive search with debounce)
- `/explore/[programId]/page.tsx` — **server component** (static fetch by ID, 404 handled by `notFound()`)
- `/chat/page.tsx` — **client component** (interactive messaging, Zustand state)

**Scope boundary**
The Figma design included sections beyond the M1 backend contract (salary cards, suitable/not-suitable, skill radar). These were intentionally excluded — only the 5 spec-required sections were built. The extra sections can be added once the backend data fields exist.

---

## Backend swap checklist

When the FastAPI backend is running and Supabase is seeded:

1. Set `NEXT_PUBLIC_USE_MOCK=false` in `.env.local`
2. Set `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1`
3. Verify `GET /api/v1/programs/search?q=` returns the `ApiResponse[ProgramSearchResult]` envelope
4. Verify `GET /api/v1/programs/{id}` returns the `ApiResponse[ProgramDetail]` envelope
5. Verify `POST /api/v1/chat` returns `ApiResponse[ChatData]` with `session_id` and non-empty `sources[]`
6. Confirm the `⚠️ โหมดทดสอบ` badge disappears (only shown when `isMock: true`)

---

## QA status

- `npm run typecheck` — ✅ zero errors
- `npm run lint` — ✅ zero errors, zero warnings
- E2E tests (M2-005, M3-006) — not yet written; planned for M4
