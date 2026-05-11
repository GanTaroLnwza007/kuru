# Program Explorer — Data Guide

This document explains how the frontend fetches program data, what fields come from the backend, and what your team needs to fill in to make the Explorer page complete.

---

## How data flows

```
Supabase DB (programs table)
  ↓  FastAPI reads & maps columns
kuru/backend/api/v1/programs.py
  ↓  JSON over HTTP
GET /api/v1/programs/search?q=...
GET /api/v1/programs/{id}
  ↓  Zod-validated TypeScript types
kuru/frontend/src/lib/api/schemas.generated.ts
  ↓  React state
kuru/frontend/src/app/explore/page.tsx
```

---

## API endpoints

### List / search programs

```
GET /api/v1/programs/search
```

Query params:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | `""` | Full-text search on `name_th` and `name_en` |
| `limit` | int | `100` | Max results (1–200) |

Response envelope:

```json
{
  "data": {
    "results": [ ProgramSummary, … ],
    "total": 34
  },
  "sources": [],
  "error": null
}
```

### Program detail

```
GET /api/v1/programs/{program_id}
```

Returns a single `ProgramDetail` (superset of `ProgramSummary`, adds `plos` and `tcas_rounds`).

---

## TypeScript types

Defined in `src/lib/api/schemas.generated.ts` and re-exported from `src/lib/api/index.ts`.

### `ProgramSummary` — used on the explorer grid

```typescript
type ProgramSummary = {
  id: string;           // e.g. "bangkhen_ddf705a9"
  name_th: string;      // Thai program name, e.g. "วิศวกรรมคอมพิวเตอร์"
  name_en: string;      // English name, e.g. "Computer Engineering"
  faculty_th: string;   // Derived Thai faculty, e.g. "คณะวิศวกรรมศาสตร์"
  faculty_en: string;   // Derived English faculty, e.g. "Faculty of Engineering"
  degree: string;       // "bachelor" | "master" | "doctoral"
  campus: string;       // Always "บางเขน" currently
  match_score: number;  // Always 1.0 from API — RIASEC match is computed client-side
  year_by_year_vibe?: string | null;  // Always empty for now — see "What to fill in"
}
```

### `ProgramDetail` — used on the detail page

```typescript
type ProgramDetail = ProgramSummary & {
  plos: Array<{
    code: string;           // "PLO1", "PLO2", …
    description_th: string; // Thai PLO description
  }>;
  tcas_rounds: Array<{
    round: string;          // "Portfolio" | "Admission"
    quota: number;          // Number of seats
    min_score: number | null;
  }>;
}
```

---

## How to call the API from a component

```typescript
import { apiClient } from "@/lib/api";
import type { ProgramSummary } from "@/lib/api";

// Fetch all programs (runs on mount)
const result = await apiClient.searchPrograms({ q: "" });
const programs: ProgramSummary[] = result.data.results;

// Search by keyword
const result = await apiClient.searchPrograms({ q: "วิศวกรรม" });

// Fetch one program's full detail
const result = await apiClient.getProgramDetail("bangkhen_ddf705a9");
const program = result.data;  // ProgramDetail
```

The `apiClient` wrapper automatically switches between real and mock data based on `NEXT_PUBLIC_USE_MOCK` in `.env.local`. Set it to `false` to hit the real backend.

---

## What the DB actually stores (Supabase `programs` table)

| Column | Type | Notes |
|--------|------|-------|
| `id` | text PK | `bangkhen_<8-char hash>` — stable across re-ingests |
| `name_th` | text | Thai program name, cleaned from PDF filename |
| `name_en` | text | English name from `program_name_mapping.csv` or auto-extracted |
| `faculty` | text | Stores the campus name ("บางเขน") — **not** the faculty |
| `degree_level` | text | `"bachelor"` / `"master"` / `"doctoral"` |
| `overview` | text | Free-text program overview (may be empty) |
| `plos` | jsonb | Array of PLO objects extracted by Gemini (may be `[]`) |
| `courses` | jsonb | Course list (may be `[]`) |
| `coverage` | jsonb | Ingestion metadata (scanned?, name_en source, etc.) |

> **Note:** `faculty_th`, `faculty_en`, `campus`, and `year_by_year_vibe` are **not** DB columns. The backend derives `faculty_th`/`faculty_en` from `name_en` using a keyword map, and hard-codes `campus = "บางเขน"`.

---

## What needs to be filled in

The explorer page works but several card fields are empty or hardcoded. Here's what your team needs to add:

### 1. `year_by_year_vibe` — program summary blurb

Currently always `""`. Displayed as the card's short description.

**Where to add it:** the `programs` table doesn't have this column yet. Two options:
- **Option A (quick):** add it to `RICH_PROGRAMS` in `src/lib/program-rich.ts` (already used for RIASEC data, salary, careers)
- **Option B (proper):** `ALTER TABLE programs ADD COLUMN year_by_year_vibe text;` then populate via Supabase dashboard or a script

### 2. PLOs and TCAS rounds on the detail page

Currently served from `PROGRAM_STUBS` in `backend/api/v1/programs.py` — a hardcoded dict keyed
by short names like `"ske"`, `"cpe"`. These keys **never match** the real DB IDs (`"bangkhen_xxxx"`
format), so the detail page always returns empty PLOs and TCAS rounds regardless of the program.

**To fix:** the `programs.plos` JSONB column and `tcas_records` table already have real data from
ingestion. Replace the `PROGRAM_STUBS` lookup in `get_program()` with direct DB reads:

```python
# In get_program(), replace the PROGRAM_STUBS lookup with:
sb = get_supabase()   # already imported — reuse or call again

plos_raw = row.get("plos") or []          # already a list from JSONB
plos = [PloItem(**p) for p in plos_raw]

_ROUND_LABEL = {"round1": "Portfolio", "round3": "Admission"}

tcas_data = (
    sb.table("tcas_records")
    .select("round,quota,gpax_min")
    .eq("program_id", program_id)
    .execute()
    .data or []
)
tcas_rounds = [
    TcasRound(
        round=_ROUND_LABEL.get(r["round"], r["round"]),
        quota=r.get("quota") or 0,
        min_score=r.get("gpax_min"),
    )
    for r in tcas_data
]
```

> **Note on `round` values:** the `tcas_records` table stores `"round1"` / `"round3"` (not
> `"Portfolio"` / `"Admission"`). The `_ROUND_LABEL` map above translates them for the frontend.

### 3. `RICH_PROGRAMS` — RIASEC tags, salary, careers, year-by-year cards

In `src/lib/program-rich.ts`. Only a handful of programs are defined. Each entry looks like:

```typescript
"bangkhen_ddf705a9": {
  riasec: ["I", "R"],          // RIASEC dimensions this program suits
  baseFit: 72,                 // Base match % when user has no RIASEC result
  salary: "~35,000 ฿/เดือน",
  cost: "15,500 ฿/เทอม",
  seats: 120,
  why: "One-line pitch for this program",
  careers: ["Software Engineer", "Data Engineer"],
  yearVibe: [                  // Optional 4-year timeline cards
    { year: 1, mood: "ปรับตัว", moodEn: "Adaptation", season: "spring",
      heat: 0.5, desc: "...", kw: ["calculus", "programming"] },
    …
  ],
  plosRich: [                  // PLO scores for the match ring
    { name: "Software Design", score: 88 },
    …
  ],
}
```

The `id` key must match the program's `id` from the DB. Run this to get all current IDs:

```bash
curl "http://localhost:8000/api/v1/programs/search" | python -m json.tool | grep '"id"'
```

---

## Current data coverage

| Field | Status |
|-------|--------|
| `name_th` / `name_en` | ✅ 34 programs, cleaned |
| `faculty_th` / `faculty_en` | ✅ Derived from `name_en` |
| `degree` / `campus` | ✅ |
| `plos` (detail page) | ⚠️ Stub keys don't match DB IDs so always empty; real JSONB data exists but isn't wired up |
| `tcas_rounds` (detail page) | ⚠️ Same — 2,524 records in DB but endpoint uses stubs with wrong keys |
| `year_by_year_vibe` | ❌ Empty for all programs |
| RIASEC tags / salary / careers | ⚠️ Only defined for programs in `RICH_PROGRAMS` |
