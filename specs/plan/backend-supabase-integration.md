# Plan: Backend–Supabase Integration (MVP)

**Goal:** Wire the frontend's Explore, Program Detail, and Chat pages to real Supabase data.
Chat stays stubbed/mock until the `kuru-pipeline` RAG package is delivered by the partner.

**Branch convention:** `feat/backend/supabase-integration`

**Deadline target:** MVP ready for demo (all pages use real data except chat)

---

## Context

### Actual DB schema (authoritative)

| Table | Key columns |
|---|---|
| `programs` | `id text PK`, `name_th`, `name_en`, `faculty` (Thai only), `degree_level`, `overview`, `plos jsonb`, `year_timeline jsonb`, `coverage jsonb`, `courses jsonb` |
| `tcas_records` | `id uuid PK`, `program_id FK→programs`, `round`, `quota int`, `gpax_min numeric`, `exam_criteria jsonb`, `portfolio_requirements jsonb` |
| `chunks` | `id uuid PK`, `program_id FK`, `source_file`, `section_type`, `content`, `embedding vector(768)` |
| `feedback` | `id uuid PK`, `session_id`, `question`, `answer`, `rating` |

### Known mismatches to resolve

1. **`programs.faculty`** is Thai-only (e.g. `"คณะวิศวกรรมศาสตร์"`). Frontend needs both `faculty_th` and `faculty_en`.
2. **`year_by_year_vibe text`** column does not exist. DB has `year_timeline jsonb`. Need to add the column and populate it.
3. **`PROGRAM_STUBS`** in `programs.py` is hardcoded for 10 IDs that partially conflict with frontend `RICH_PROGRAMS`. Must replace with DB-driven data.
4. **Program ID set** — frontend `RICH_PROGRAMS` uses `cpe, ske, agri-econ, bio-tech, arch, vet, food-sci, finance, env-eng, psychology`. These must be reconciled against actual DB IDs (Phase 0 discovery).
5. **`kuru-pipeline`** (`../pipeline`) does not exist. Chat endpoint imports from it; it will crash on startup. Must guard the import.

---

## Phase 0 — Discovery (before writing any code)

> Run against the real Supabase instance to establish ground truth.

### Task 0.1 — List all programs in DB

```sql
SELECT id, name_th, name_en, faculty, degree_level
FROM programs
ORDER BY faculty, name_en;
```

**Deliverable:** a list of actual IDs to use as the canonical 20-program set.

### Task 0.2 — Inspect `plos` JSONB shape

```sql
SELECT id, plos FROM programs WHERE plos != '[]' LIMIT 3;
```

**Expected shape:** `[{"code": "...", "description_th": "..."}]` — matching `PloItem` schema.
If shape differs, note the actual keys so the backend mapper can normalize them.

### Task 0.3 — Inspect `year_timeline` JSONB shape

```sql
SELECT id, year_timeline FROM programs WHERE year_timeline != '[]' LIMIT 2;
```

**Needed to:** decide whether to convert year_timeline to a text vibe on the fly or via a generation script.

### Task 0.4 — Check tcas_records coverage

```sql
SELECT program_id, count(*) AS rounds
FROM tcas_records
GROUP BY program_id
ORDER BY program_id;
```

**Needed to:** know which programs have TCAS data and which need stubs.

### Task 0.5 — Guard chat startup crash

**Immediately** wrap the `kuru-pipeline` import in `chat.py` to prevent the server failing to start:

```python
# api/v1/chat.py
try:
    from kuru.rag.query_engine import query as rag_query
    _RAG_AVAILABLE = True
except ImportError:
    _RAG_AVAILABLE = False
```

If `_RAG_AVAILABLE` is False, the `/chat` endpoint returns a structured stub response with `confidence_level="low"` and a canned Thai message. This lets the backend start and allows all other endpoints to function.

---

## Phase 1 — Program Set Alignment

> Select the canonical 20 programs and align IDs across DB, backend, and frontend.

### Task 1.1 — Select 20 Bang Khen programs

Using Phase 0 discovery results, pick 20 programs that:
- Exist in the DB with non-empty data
- Cover a range of faculties (Engineering, Science, Agriculture, Business, Humanities, Social Sciences, Veterinary)
- Match the programs already modeled in frontend `RICH_PROGRAMS` where possible

**Suggested target coverage (adjust after Task 0.1):**

| Faculty | Programs |
|---|---|
| Engineering | `cpe`, `ske`, (+ 1 more, e.g. `env-eng` or `civil`) |
| Science | `cs`, `env_sci`, (+ 1 bio) |
| Agriculture | `agronomy`, `horticulture` |
| Business | `bus_mgmt`, `bus_fin`, (+ 1 accounting or marketing) |
| Humanities | `english` |
| Social Sciences | `sociology`, `psychology` |
| Veterinary | `vet` |
| Architecture/Arts | `arch` |
| + more to reach 20 | fill from discovery |

### Task 1.2 — Update frontend `RICH_PROGRAMS` IDs

In `frontend/src/lib/program-rich.ts`:
- Rename any IDs that don't match DB (e.g. `agri-econ` → whatever ID is in DB, `finance` → `bus_fin`, etc.)
- For programs with no DB equivalent, either find the correct DB ID or replace with a program that does exist

### Task 1.3 — Update frontend `mock-data.ts` IDs

`frontend/src/lib/api/mock-data.ts` must use the same IDs as the DB so switching from mock to real doesn't produce 404s.

### Task 1.4 — Add missing programs to DB (if needed)

If some chosen programs are in `RICH_PROGRAMS` but not yet in DB, add an upsert script:

```
scripts/seed_gap_programs.py
```

This script should upsert any programs missing from DB with at minimum `id, name_th, name_en, faculty, degree_level`. PLOs and TCAS can start empty; they'll be filled in Phase 3.

---

## Phase 2 — Backend API Fix

> Make `GET /programs/search` and `GET /programs/{id}` return correct data from Supabase.

### Task 2.1 — Add Thai→English faculty name map to `programs.py`

The DB `faculty` field is Thai (e.g. `"คณะวิศวกรรมศาสตร์"`). Replace `_derive_faculty(name_en)` with a direct lookup:

```python
_FACULTY_EN: dict[str, str] = {
    "คณะวิศวกรรมศาสตร์": "Faculty of Engineering",
    "คณะวิทยาศาสตร์": "Faculty of Science",
    "คณะเกษตร": "Faculty of Agriculture",
    "คณะบริหารธุรกิจ": "Faculty of Business Administration",
    "คณะมนุษยศาสตร์": "Faculty of Humanities",
    "คณะสังคมศาสตร์": "Faculty of Social Sciences",
    "คณะสัตวแพทยศาสตร์": "Faculty of Veterinary Medicine",
    "คณะสถาปัตยกรรมศาสตร์": "Faculty of Architecture",
    "คณะประมง": "Faculty of Fisheries",
    "คณะวนศาสตร์": "Faculty of Forestry",
    # add more as discovered in Task 0.1
}
```

### Task 2.2 — Fix `_row_to_summary` mapping

Update to use `faculty` column directly:

```python
def _row_to_summary(row: dict) -> ProgramSummary:
    faculty_th = row.get("faculty") or ""
    faculty_en = _FACULTY_EN.get(faculty_th, faculty_th)
    return ProgramSummary(
        id=row["id"],
        name_th=row.get("name_th") or row.get("name_en", ""),
        name_en=row.get("name_en") or "",
        faculty_th=faculty_th,
        faculty_en=faculty_en,
        degree=row.get("degree_level") or "bachelor",
        campus="บางเขน",
        match_score=1.0,
        year_by_year_vibe=row.get("year_by_year_vibe") or "",
    )
```

### Task 2.3 — Fix search query columns

Update the `select()` call to include all needed columns:

```python
db_query = sb.table("programs").select(
    "id,name_th,name_en,faculty,degree_level,year_by_year_vibe"
)
```

Add optional `faculty` filter support:

```python
if faculty:
    db_query = db_query.eq("faculty", faculty)
```

### Task 2.4 — Fix `GET /programs/{id}` — real PLOs and TCAS from DB

Replace the `PROGRAM_STUBS` lookup with DB queries:

```python
# Fetch PLOs from programs.plos JSONB
plo_raw = row.get("plos") or []
plos = [PloItem(**p) for p in plo_raw if p.get("code")]

# Fetch TCAS from tcas_records table
tcas_resp = sb.table("tcas_records") \
    .select("round,quota,gpax_min") \
    .eq("program_id", program_id) \
    .execute()
tcas_rounds = [
    TcasRound(round=t["round"], quota=t["quota"], min_score=t.get("gpax_min"))
    for t in (tcas_resp.data or [])
]
```

**Note:** `TcasRound.min_score` maps from `tcas_records.gpax_min`. If the frontend schema uses a different field name, update `models/schemas.py` `TcasRound`.

### Task 2.5 — Remove `PROGRAM_STUBS`

Once Task 2.4 is complete and tested, delete the entire `PROGRAM_STUBS` dict and the associated `# TODO` comment.

---

## Phase 3 — Data Gaps & `year_by_year_vibe`

> Ensure all 20 programs have quality data in DB.

### Task 3.1 — Add `year_by_year_vibe` column via migration

Create `backend/migrations/002_add_year_vibe.sql`:

```sql
ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS year_by_year_vibe text;
```

Run in Supabase SQL Editor.

### Task 3.2 — Write vibe generation script

Create `scripts/gen_year_vibes.py`. For each program:
1. Read `name_th`, `name_en`, `faculty`, `plos` from DB
2. If `year_timeline` is non-empty, convert it to a 4-sentence text directly from the JSON
3. If `year_timeline` is empty, call Gemini with the prompt in `.github/prompts/year-by-year-vibe.prompt.md`
4. Upsert the result into `programs.year_by_year_vibe`

Script must be idempotent (skip programs that already have a non-empty vibe).

### Task 3.3 — Audit and fill missing PLOs

Create `scripts/audit_programs.py` that prints a table of programs with empty `plos`, empty `tcas_records`, or empty `year_by_year_vibe`. Use this to identify data gaps before flipping the frontend to real API.

### Task 3.4 — Fill missing TCAS stubs

For programs with no `tcas_records` rows, create `scripts/seed_tcas_stubs.py` that inserts minimal Portfolio + Admission round records (quota and gpax_min from `PROGRAM_STUBS` if available, otherwise use 0 / null).

---

## Phase 4 — Frontend Wiring

> Switch Explore and Program Detail from mock to real API.

### Task 4.1 — Create `frontend/.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_USE_MOCK=false
```

Keep `NEXT_PUBLIC_USE_MOCK=true` for chat only. See Task 4.4.

### Task 4.2 — Wire `explore/page.tsx` to real API

Replace the `RICH_PROGRAMS` array used for the card grid with `apiClient.searchPrograms()`.
Keep `RICH_PROGRAMS` only for RIASEC `computeProgramMatch()` — the API does not return RIASEC alignment data.

Changes:
- Add `useEffect` + `useState` (or React Query) to call `searchPrograms` on mount and on query/faculty filter change
- Replace static card data with API results
- Show skeleton cards while loading
- Show empty-state text when `results.length === 0`

### Task 4.3 — Wire `explore/[programId]/page.tsx` to real API

Replace the direct `RICH_PROGRAMS[programId]` access for PLOs and TCAS with `apiClient.getProgramDetail(programId)`.
Keep `RICH_PROGRAMS[programId]` for:
- RIASEC alignment (MatchRing match %)
- YearVibeTimeline mood/heatmap data
- Career paths

**Fallback:** if `programId` not found in `RICH_PROGRAMS`, hide the RIASEC match ring and career grid gracefully (don't crash).

### Task 4.4 — Split mock flag for chat vs programs

Update `frontend/src/lib/api/index.ts` to allow per-feature mock override:

```ts
const useMockPrograms = process.env.NEXT_PUBLIC_USE_MOCK_PROGRAMS === "true"
  || process.env.NEXT_PUBLIC_USE_MOCK === "true";
const useMockChat = process.env.NEXT_PUBLIC_USE_MOCK_CHAT === "true"
  || process.env.NEXT_PUBLIC_USE_MOCK === "true";
```

Set `NEXT_PUBLIC_USE_MOCK_CHAT=true` in `.env.local` so chat stays on mock while programs use real API.

### Task 4.5 — Validate Zod schemas against real response

Run the backend locally with real Supabase, call the endpoints, and paste responses into `schemas.generated.ts` validation. Fix any mismatched field names (e.g. `min_score` vs `gpax_min`, `degree` vs `degree_level`).

---

## Phase 5 — Chat Stub (until pipeline is ready)

> Keep chat functional for demos without crashing.

### Task 5.1 — Implement graceful stub in `chat.py`

When `_RAG_AVAILABLE` is False (from Phase 0 Task 0.5), return:

```python
return JSONResponse(content=ApiResponse[ChatResponse](
    data=ChatResponse(
        answer="ระบบ RAG กำลังอยู่ระหว่างการพัฒนา กรุณากลับมาใหม่เร็วๆ นี้ 🙏",
        session_id=session_id,
        confidence_level="low",
        sources=[],
        used_tcas_data=False,
    )
).model_dump())
```

### Task 5.2 — Document `rag_query` interface for pipeline team

Create `specs/context/rag-interface.md`:

```
Input:
  question: str
  program_id: str | None
  conversation_history: list[{"role": "user"|"assistant", "content": str}]  # max 5 turns

Return type (duck-typed, not a formal class):
  result.answer: str
  result.sources: list[{"source_file": str, "section_type": str, "similarity": float}]
  result.used_tcas_data: bool
```

This ensures the pipeline team's implementation is drop-in compatible with `chat.py`.

---

## Phase 6 — Integration & Testing

> Verify the full flow works end-to-end before marking integration complete.

### Task 6.1 — Manual happy-path test

1. Start backend: `cd backend && uv run uvicorn main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to `/explore` → cards should load from real DB
4. Click a program → PLOs and TCAS should come from real DB
5. `/chat` → stub message appears, no crash

### Task 6.2 — Verify RIASEC → Explore match flow

1. Complete RIASEC quiz → get scores
2. Navigate to `/explore` → match % should render on cards (uses RICH_PROGRAMS, not API)
3. Click a program → MatchRing should show correct %

### Task 6.3 — Run test suite

```bash
cd frontend && npm run typecheck && npm run test
```

Fix any type errors from schema or ID changes.

### Task 6.4 — Update mock-data to match real data shape

After real API is live, update `mock-data.ts` to mirror the real response shapes so tests continue to pass when mock mode is re-enabled.

---

## Risk Register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Some programs have empty `plos` in DB | High | Task 3.3 audit + Task 3.4 stubs |
| `year_timeline` JSONB shape varies per program | Medium | Task 0.3 inspection before writing mapper |
| IDs in DB don't match any RICH_PROGRAMS keys | High | Phase 1 alignment before any wiring |
| Backend crash on `kuru-pipeline` missing | Certain right now | Task 0.5 guard — do this first |
| Gemini API quota during vibe generation | Low | Script processes one at a time, idempotent |

---

## Dependency map

```
Phase 0 (discovery + crash guard)
  └─ Phase 1 (program IDs)
       ├─ Phase 2 (backend API fix)
       │    └─ Phase 3 (data gaps)
       │         └─ Phase 4 (frontend wiring)
       │              └─ Phase 6 (integration test)
       └─ Phase 5 (chat stub)  ← independent, do early
```

Phase 5 is independent and should be done alongside Phase 0 to unblock backend startup.
