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
