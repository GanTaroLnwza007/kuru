# Ingestion Guide

How to ingest curriculum PDFs and TCAS data into the KUru pipeline.

---

## Prerequisites

- `.env` file with `SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`, `TYPHOON_API_KEY`, and `OPENROUTER_API_KEY`
- TCAS files downloaded (`uv run kuru-download`)
- Curriculum PDFs downloaded from the registrar (`uv run kuru-scrape-curriculum`)
- DB tables created (`uv run kuru-setup-db`)

---

## Commands

All commands must be run with `$env:PYTHONUTF8=1;` prefix in PowerShell (Windows UTF-8 fix).

### TCAS data (fast, run first)

```powershell
$env:PYTHONUTF8=1; uv run kuru-ingest-tcas
```

Takes a few minutes. Safe to re-run — skips already-ingested records.

---

### Curriculum PDFs

The curriculum ingest reads from `data/native/curriculum/`, but that directory name is historical. Registrar downloads in this folder may be born-digital, scanned, or mixed PDFs. For the current extraction and cost behavior, see [current-ingestion-state.md](current-ingestion-state.md).

#### Test batch — 50 files across all faculties (~2 hrs)

Run this first before committing to the full ingest.

```powershell
$env:PYTHONUTF8=1; uv run kuru-ingest-mko --sample=50
```

#### Full ingest — all registrar files (run overnight)

```powershell
$env:PYTHONUTF8=1; uv run kuru-ingest-mko
```

#### Specific campus

```powershell
$env:PYTHONUTF8=1; uv run kuru-ingest-mko กำแพงแสน
```

---

## Monitoring progress

Open a second terminal while ingest is running:

```powershell
$env:PYTHONUTF8=1; uv run python scripts/ingestion_monitor.py
```

Prints every 30s:
```
[10:15:32]  Files: 12/50  |  Chunks: 18,432  (+3 files, +4,210 chunks)  [running]
```

The ingest script itself also prints a heartbeat line every 30s so the terminal never looks frozen.

---

## OCR and cost routing

Curriculum ingestion uses PyMuPDF first. Low-yield pages are sent to Typhoon page OCR when `TYPHOON_API_KEY` is available, so those calls will not appear in Gemini billing. Fully scanned PDFs are sent through `OCR_MODEL` only after the document-level scanned threshold is reached.

Defaults:

| Work | Default | Key |
|------|---------|-----|
| Structured extraction | `LLM_MODEL=gemini-2.5-flash-lite` | `GEMINI_API_KEY` |
| Fully scanned PDF OCR | `OCR_MODEL=gemini-2.5-flash` | `GEMINI_API_KEY` |
| Low-yield page OCR | `typhoon-ocr` | `TYPHOON_API_KEY` |
| RAG answer generation | `GENERATION_MODEL=google/gemini-2.5-flash-lite` | `OPENROUTER_API_KEY` |

Set `OCR_MODEL=google/gemini-2.5-flash` only when you intentionally want full scanned-PDF OCR to route through OpenRouter.

---

## Pausing and resuming

**Ctrl+C** stops the ingest immediately. Any file already fully committed to Supabase is safe.
Re-running the same command resumes from where it stopped — completed files are skipped automatically.

```powershell
# Resume — same command, picks up where it left off
$env:PYTHONUTF8=1; uv run kuru-ingest-mko --sample=50
```

Killing the terminal has the same effect as Ctrl+C.

---

## Clearing data

### Clear all curriculum chunks (keeps TCAS intact)

```powershell
$env:PYTHONUTF8=1; uv run python scripts/clear_chunks.py
```

### Clear a single file's chunks (force re-ingest)

```powershell
$env:PYTHONUTF8=1; uv run python -c "
from kuru.db.supabase_client import get_client
db = get_client()
fname = 'ปร.ด._กีฏวิทยา_2565.pdf'
db.table('chunks').delete().eq('source_file', fname).execute()
print('Cleared:', fname)
"
```

Then re-run the ingest command — that file will be re-processed.

---

## Crash recovery

The ingest is mostly crash-safe:

| Crash during | Data in DB | On next run |
|--------------|------------|-------------|
| Extraction/OCR phase (minutes to hours for large scans) | Nothing written | File retried automatically ✓ |
| Embed/upsert phase (~5 sec) | Partial chunks possible | File skipped (use clear script above) ⚠ |
| File already done | Full chunks committed | Skipped ✓ |

The upsert window is short compared with extraction/OCR time, so the risk is low for normal files. Very large scans should be re-run as targeted jobs.

---

## After ingest — verify

```powershell
$env:PYTHONUTF8=1; uv run kuru-demo
```

### Data hygiene after source changes

When replacing Google Drive/compact PDFs with registrar PDFs, run the maintenance scripts from `pipeline/`:

```powershell
$env:PYTHONUTF8=1; uv run python scripts/cleanup_program_duplicates.py --apply
$env:PYTHONUTF8=1; uv run python scripts/backfill_program_names_from_chunks.py --apply
$env:PYTHONUTF8=1; uv run python scripts/backfill_program_metadata.py --apply
```

These scripts remove known stale duplicate program rows/chunks, fill missing English names from chunks, and populate safe UI metadata (`slug`, `year_by_year_vibe`, `coverage`). They do not invent missing PLOs, course lists, timelines, or curriculum mappings; those require structured extraction from the source document.

For rows ingested before the targeted structured-completion pass was added, you can repair missing semantic fields without re-OCRing or re-embedding:

```powershell
$env:PYTHONUTF8=1; uv run python scripts/backfill_structured_from_chunks.py --limit 3
$env:PYTHONUTF8=1; uv run python scripts/backfill_structured_from_chunks.py --limit 3 --apply
```

New ingests run this completion logic automatically after the first structured extraction call, so this script should be a migration tool rather than a normal operating step.

Sample queries to test coverage:
- `What courses are in the Computer Engineering program?`
- `What are the PLOs for Entomology PhD?`
- `What are the TCAS3 requirements for Software and Knowledge Engineering?`
- `หลักสูตรวิศวกรรมไฟฟ้ามีรายวิชาอะไรบ้าง`
