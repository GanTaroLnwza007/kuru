# Backend Foundation — 2026-05-11

## Branch
`feat/backend/foundation`

## Status
✅ Complete — all 20 curated programs served from live Supabase data; no hardcoded stubs remain in the program API.

---

## What was done

### 1. DB migration — `backend/migrations/002_add_slug_year_vibe.sql`
Added two columns to the `programs` table:
- `slug TEXT UNIQUE` — URL-friendly identifier (e.g. `computer-eng`)
- `year_by_year_vibe TEXT` — condensed Thai summary derived from `year_timeline` JSONB
- Indexed `slug` for fast lookup.

### 2. Data scripts — `scripts/assign_slugs.py` · `scripts/link_tcas.py`
Both scripts are idempotent and operate against Supabase directly.

- **`assign_slugs.py`**: maps all 20 canonical program hash IDs to their slugs and computes `year_by_year_vibe` by condensing the first 4 years of `year_timeline` narratives (≤110 chars each).
- **`link_tcas.py`**: resolves orphaned `tcas_records` rows (`program_id IS NULL`) by extracting the core program name from `program_name_raw` (strips the Thai degree abbreviation) and fuzzy-matching against `programs.name_th`. Only accepts matches with >40% name coverage.

### 3. Programs API — `backend/api/v1/programs.py` + `backend/models/schemas.py`
Largest change. Removed the 150-line `PROGRAM_STUBS` dict entirely.

- **PLOs**: read from `programs.plos` JSONB column (shape: `[{id, category, description}, ...]`).
- **TCAS rounds**: joined live from `tcas_records` table on `program_id`.
- **Search**: now restricted to the 20 slug-assigned programs. Fetches 500 rows and post-filters to `slug IS NOT NULL`, so the curated set is stable regardless of DB ordering.
- **Detail endpoint**: accepts either a slug (`/programs/computer-eng`) or a hash ID — tries slug first, falls back to ID.
- **`_FACULTY_MAP`** extended with: Bioscience, Physics, Finance, Economics, French, English, Architecture.
- **`_NAME_TH_OVERRIDES`** dict replaces the old `_clean_name_th` regex (overrides for earth-science, nursing, law, ske-intl where DB name_th is a document artifact).
- **`_DEGREE_MAP`** localises `degree_level` values to Thai labels (ปริญญาตรี / โท / เอก).
- **`ProgramSummary`** schema gains a `slug` field alongside the existing `id`.

### 4. Chat fallback — `backend/api/v1/chat.py`
Wraps the `kuru.rag` import in a try/except. When the pipeline package is absent the `/chat` endpoint returns a Thai stub response (confidence: low, sources: []) instead of crashing at import time. Unblocks local development without the pipeline installed.

### 5. CORS config — `backend/core/config.py`
Added a `field_validator` on `cors_origins` so `CORS_ORIGINS="http://localhost:3000,https://kuru.example.com"` in `.env` parses as a list correctly.

### 6. Deps cleanup — `backend/pyproject.toml`
Commented out the `kuru-pipeline` dependency and its `[tool.uv.sources]` entry. The pipeline package lives in a separate repo; re-enable when `../pipeline` exists.

---

## Commit plan

| # | Commit message | Files |
|---|---|---|
| 1 | `data(db): add slug and year_by_year_vibe columns to programs` | `backend/migrations/002_add_slug_year_vibe.sql` |
| 2 | `data(db): add assign_slugs and link_tcas scripts for 20 curated programs` | `scripts/assign_slugs.py`, `scripts/link_tcas.py` |
| 3 | `feat(programs): replace hardcoded stubs with live PLO and TCAS from DB` | `backend/api/v1/programs.py`, `backend/models/schemas.py` |
| 4 | `fix(chat): return Thai stub when RAG package import fails` | `backend/api/v1/chat.py` |
| 5 | `fix(config): support comma-separated CORS_ORIGINS in .env` | `backend/core/config.py` |
| 6 | `chore(deps): comment out kuru-pipeline until pipeline package exists` | `backend/pyproject.toml`, `backend/uv.lock` |

---

## What's unblocked next
- Frontend can now call `/programs/{slug}` and receive real PLO + TCAS data.
- RAG pipeline integration: un-stub `backend/api/v1/chat.py` once `kuru.rag` is importable.
- Run `scripts/assign_slugs.py` and `scripts/link_tcas.py` against production Supabase after applying migration 002.

---

## How to connect the frontend chat page to the real backend

### Current state

The frontend chat page (`frontend/src/app/chat/page.tsx`) is wired and ready. It calls
`apiClient.chat(...)` which routes through `frontend/src/lib/api/index.ts`. By default the
chat is kept on **mock mode** (`NEXT_PUBLIC_USE_MOCK_CHAT=true` in `frontend/.env.local`) so the
page works without a running backend.

### Step 1 — Run both services

**Backend** (terminal 1):

```bash
cd backend
uv run uvicorn main:app --reload
# → listening on http://localhost:8000
```

**Pipeline** — the backend's `/chat` endpoint imports `kuru.rag` at request time. For this
import to succeed, the pipeline package must be installed into the **backend's** virtual env:

```bash
cd backend
uv add --editable ../pipeline
```

Then restart uvicorn.

**Frontend** (terminal 2):

```bash
cd frontend
npm run dev
# → listening on http://localhost:3000
```

### Step 2 — Point the frontend at the backend

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Change this line — remove mock override so chat hits the real backend
NEXT_PUBLIC_USE_MOCK_CHAT=false
```

Restart the Next.js dev server after editing `.env.local`.

### Step 3 — Verify

Open `http://localhost:3000/chat` and send a message. You should see:

- **No** `[mock]` badge on the assistant bubble.
- `confidence_level` of `"high"` or `"medium"` (not `"low"`) for a well-matched query.
- Source chips in the right rail listing actual PDF filenames.

To confirm the backend received the request, check the uvicorn terminal — you should see a
`POST /api/v1/chat` line with a 200 status.

### How the data flows

```text
frontend/src/app/chat/page.tsx
  └─ apiClient.chat({ message, program_context_id, session_id, conversation_history })
       └─ realApiClient  →  POST http://localhost:8000/api/v1/chat
            └─ backend/api/v1/chat.py :: chat()
                 └─ kuru.rag.query_engine.query()   ← pipeline package
                      ├─ embed question (multilingual-e5, local)
                      ├─ similarity_search → Supabase pgvector
                      └─ generate answer  → Gemini 2.5 Flash Lite
            └─ ChatResponse { answer, session_id, confidence_level, sources, used_tcas_data }
  └─ addMessage() → renders in MessageList with source chips and confidence badge
```

### Chatting in context of a specific program

The explore page (`/explore/[programId]`) has a "Chat about this program" button. It navigates
to `/chat?program_id=<id>&program_name=<name>`. The chat page reads these params and passes
`program_context_id` in every request, which causes the RAG engine to pre-filter chunks to that
program before doing the similarity search.

### Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `[mock]` badge appears | `NEXT_PUBLIC_USE_MOCK_CHAT` is still `true` | Set it to `false` and restart Next.js |
| Network error / CORS | Backend not running or wrong port | Check uvicorn is on `:8000`; confirm `CORS_ORIGINS` in `backend/.env` includes `http://localhost:3000` |
| Answer is Thai stub about system under development | Pipeline not installed in backend venv | Run `uv add --editable ../pipeline` inside `backend/` |
| `KeyError: SUPABASE_URL` in backend logs | `backend/.env` missing or not loaded | Ensure `backend/.env` has `SUPABASE_URL` and `SUPABASE_KEY` |
| Statement timeout on first query | `ivfflat.probes` too high | Already reduced to 10 in `pipeline/src/kuru/db/supabase_client.py` |
