# Handoff: Ingestion Cleanup and Structured Repair

_Date: 2026-05-13_  
_Branch: `chore/pipeline-reorganize`_

This handoff summarizes the ingestion/database cleanup work done after merging registrar curriculum PDFs into the KUru pipeline.

## What Changed

### 1. Clarified source directories

`data/native/curriculum/` is a historical ingest path. It does **not** mean the registrar PDFs are truly born-digital/native PDFs. Registrar files may be text PDFs, scanned PDFs, or mixed PDFs with image-only pages.

Current extraction flow:

1. PyMuPDF first.
2. Low-yield pages use Typhoon page OCR when `TYPHOON_API_KEY` is present.
3. Fully scanned documents use `OCR_MODEL`.
4. Chunks are embedded locally with multilingual-e5.
5. Structured extraction uses Gemini text mode.
6. If structured fields are missing, ingestion now runs a targeted completion pass over section-tagged chunks.

Docs updated:

- `pipeline/docs/current-ingestion-state.md`
- `pipeline/docs/ingestion-guide.md`
- `pipeline/docs/scraper.md`
- `pipeline/docs/SETUP.md`

### 2. Confirmed API/cost behavior

Normal RAG chat uses OpenRouter through `GENERATION_MODEL`.

Direct Gemini usage is mainly:

- structured extraction (`LLM_MODEL=gemini-2.5-flash-lite`)
- full scanned-PDF OCR when `OCR_MODEL=gemini-2.5-flash`
- any manual/direct tests using `kuru.llm.get_client()`

Low Gemini usage does not prove no OCR happened, because low-yield page OCR is Typhoon.

### 3. Cleaned duplicate programs and chunks

Root cause: `program_id` is derived from source path and filename stem. Old Google Drive/compact PDFs and newer registrar PDFs can represent the same curriculum but get different program IDs. Chunks can duplicate too because resume detection was based on `source_file`.

Cleanup result:

- Programs: `72 -> 57`
- Chunks: `14,326 -> 13,910`
- Duplicate `name_en`: `0`
- Duplicate `name_th`: `0`
- Missing `name_en`: `0`

Bad row fixed:

- Before: `name_th=นานาชาติ`, `name_en=Software and Knowledge Engineering (International Program)`
- After: `name_th=บัญชีบัณฑิต`, `name_en=Bachelor of Accountancy Program (International Program)`
- Reason: its chunks were from Accountancy, not SKE.

Scripts added:

- `pipeline/scripts/cleanup_program_duplicates.py`
- `pipeline/scripts/backfill_program_names_from_chunks.py`
- `pipeline/scripts/backfill_program_metadata.py`

### 4. Repaired structured fields in the existing DB

We added the shared targeted completion logic and then used it to repair existing DB rows without re-OCRing or re-embedding:

```powershell
$env:PYTHONUTF8=1; uv run python scripts/backfill_structured_from_chunks.py --limit 100 --apply
```

Before -> after:

| Field | Before missing | After missing |
|---|---:|---:|
| `overview` | 36 / 57 | 4 / 57 |
| `plos` | 44 / 57 | 26 / 57 |
| `courses` | 23 / 57 | 0 / 57 |
| `year_timeline` | 32 / 57 | 14 / 57 |
| `curriculum_mapping` | 46 / 57 | 24 / 57 |

Remaining gaps are semantic. Do not fill them with placeholders. A missing PLO or curriculum mapping may mean the source document does not contain that section, or OCR/table extraction was not reliable enough.

### 5. Strengthened ingestion so this is not a recurring manual cleanup

`pipeline/src/kuru/ingestion/structured_extractor.py` now has:

- `extract_structured()`: first-pass document extraction.
- `extract_structured_complete()`: first pass plus targeted completion.
- `complete_structured_from_chunks()`: reusable repair logic for existing DB rows.

`pipeline/src/kuru/scripts/ingest_curriculum.py` now calls:

```python
structured = extract_structured_complete(doc_text, chunks, verbose=verbose)
```

So new ingests should fill more structured fields during ingestion rather than requiring post-hoc repair.

## Important Scripts

Run from `pipeline/`.

```powershell
# Remove known stale duplicate program rows/chunks and fix known bad names
$env:PYTHONUTF8=1; uv run python scripts/cleanup_program_duplicates.py --apply

# Infer missing English names from existing chunks
$env:PYTHONUTF8=1; uv run python scripts/backfill_program_names_from_chunks.py --apply

# Fill safe UI metadata: slug, year_by_year_vibe, missing coverage
$env:PYTHONUTF8=1; uv run python scripts/backfill_program_metadata.py --apply

# Repair missing semantic structured fields from existing chunks
$env:PYTHONUTF8=1; uv run python scripts/backfill_structured_from_chunks.py --limit 100 --apply
```

The first three are data-hygiene scripts. The fourth uses Gemini text calls.

## Current DB Status

After repairs:

- `id`: 0 missing
- `name_th`: 0 missing
- `name_en`: 0 missing
- `faculty`: 0 missing
- `degree_level`: 0 missing
- `coverage`: 0 missing
- `slug`: 0 missing
- `year_by_year_vibe`: 0 missing
- `courses`: 0 missing

Remaining:

- `overview`: 4 missing
- `plos`: 26 missing
- `year_timeline`: 14 missing
- `curriculum_mapping`: 24 missing

## DVM Caveat

`bangkhen_vet_9ea52f52` / `สพ.บ._2568.pdf` is an 870-page DVM PDF.

It currently has structured data but had a prior interrupted chunk retry, so treat it carefully. It may need a dedicated overnight targeted run rather than being mixed into a general ingest batch.

## Merge State

Pulled `origin/main` into `chore/pipeline-reorganize` and resolved one conflict:

- File: `pipeline/src/kuru/scripts/ingest_curriculum.py`
- Conflict: `extract_structured` from main vs `extract_structured_complete` from this branch
- Resolution: kept `extract_structured_complete`

Merge commit:

- `0c0c519 Merge remote-tracking branch 'origin/main' into chore/pipeline-reorganize`

Recent relevant commits:

- `43b697d feat: complete structured extraction during ingest`
- `5cd7b53 docs: record program table cleanup status`
- `e7c8d31 fix: backfill missing program English names`
- `6902ad8 fix: clean duplicate program records`
- `12b2552 docs: clarify current ingestion state`

## What To Do Next

1. Run targeted evaluation/RAG smoke tests after the DB repair.
2. Spot-check programs still missing PLOs or curriculum mapping; do not assume those are extractor bugs until the source PDF is checked.
3. Consider improving section detection for OCR-heavy table pages if PLO/course mappings remain important.
4. Re-ingest DVM as a dedicated job if chunks are required for that program.
5. Push `chore/pipeline-reorganize` when ready.

