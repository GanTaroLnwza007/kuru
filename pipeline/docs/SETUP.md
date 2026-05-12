# KUru Pipeline — Setup Guide

Complete walkthrough from credentials to first demo.

---

## Prerequisites

- Python 3.11+
- [`uv`](https://docs.astral.sh/uv/) — `pip install uv`
- A [Supabase](https://supabase.com) project with pgvector enabled
- A [Neo4j Aura Free](https://neo4j.com/cloud/platform/aura-graph-database/) instance _(optional — only needed for PLO graph queries)_
- A `GEMINI_API_KEY` for structured extraction and direct Gemini OCR
- A `TYPHOON_API_KEY` for page-level OCR on low-yield scanned pages
- An [OpenRouter](https://openrouter.ai) API key (for RAG generation, and optional routed OCR)
- Public access to the KU registrar curriculum pages

---

## Step 1 — Credentials

Copy `.env.example` to `.env` and fill in:

```env
# Gemini (structured extraction and direct full-PDF OCR)
GEMINI_API_KEY=...

# Typhoon (page OCR for low-yield pages)
TYPHOON_API_KEY=...

# OpenRouter (RAG generation; optional OCR routing)
OPENROUTER_API_KEY=sk-or-...

# Supabase (vector store)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_KEY=<service_role key>
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres

# Neo4j (PLO graph — optional)
NEO4J_URI=neo4j+s://<id>.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=<password>
```

### Where to get each key

**`GEMINI_API_KEY`**
1. Create a key in Google AI Studio
2. Use it for `LLM_MODEL` and direct Gemini `OCR_MODEL` values such as `gemini-2.5-flash`

**`TYPHOON_API_KEY`**
1. Create a key at OpenTyphoon
2. Use it for page-level OCR on low-yield pages inside otherwise readable PDFs

**`OPENROUTER_API_KEY`**
1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Dashboard → **Keys** → **Create key**
3. Add credit for RAG generation, or for OCR only when `OCR_MODEL` is set to a provider-prefixed value such as `google/gemini-2.5-flash`

**`SUPABASE_URL` and `SUPABASE_KEY`**
1. Supabase dashboard → **Project Settings** → **API**
2. Copy **Project URL** → `SUPABASE_URL`
3. Copy **service_role** key → `SUPABASE_KEY` (not the `anon` key — write access needed)

**`DATABASE_URL`**
1. Same page → **Database** → **Connection string** → **URI** tab
2. Replace `[YOUR-PASSWORD]` with your database password

**`NEO4J_*`** _(skip if not using PLO graph)_
1. [console.neo4j.io](https://console.neo4j.io) → **New Instance** → **Free**
2. Download the generated credentials file — it contains all three values

---

## Step 2 — Install Dependencies

```bash
uv sync
```

Creates `.venv/` and installs everything from `pyproject.toml`. The multilingual-e5 embedding model (~280 MB) is downloaded on first query automatically.

---

## Step 3 — Apply the Database Schema

```bash
uv run kuru-setup-db
```

This connects to Supabase via `DATABASE_URL` and executes `db/schema.sql`, which creates:

| Object | Purpose |
|--------|---------|
| `programs` table | Canonical program registry (name_th, name_en, coverage, etc.) |
| `chunks` table | Document chunks with `vector(768)` embeddings |
| `tcas_records` table | Structured TCAS admission data |
| `match_chunks()` RPC | pgvector similarity search with `ivfflat.probes=50` for full recall |

> **Note:** Neo4j constraints are also applied here. If Neo4j is not configured, a DNS error is printed but the Supabase setup still completes.

---

## Step 4 — Download Source Data

```bash
# TCAS data from Google Drive
uv run kuru-download

# Registrar curriculum PDFs from https://registrar.ku.ac.th/cur/all
uv run kuru-scrape-curriculum

# Subsequent Drive runs — only fetch files missing locally
uv run kuru-download --sync
```

Downloads into:
- `data/native/tcas/` — TCAS PDFs + xlsx score spreadsheets
- `data/native/curriculum/บางเขน/` — registrar มคอ.2 curriculum PDFs (บางเขน campus)
- `data/native/curriculum/กพส/` — กพส campus PDFs from Drive, if configured
- Any folders linked via `.txt` redirect files (followed automatically)

`data/native/curriculum` is a historical working path, not a guarantee that the PDFs are born-digital. Registrar downloads can be scanned or mixed PDFs. See [current-ingestion-state.md](current-ingestion-state.md) for the live extraction and cost behavior.

**If a file fails to download** (permission or gdown glitch), add its Drive file ID to `MANUAL_RETRY` in `download_data.py` and re-run.

**For additional campuses** (กำแพงแสน, ศรีราชา): add the Drive folder IDs to `EXTRA_CAMPUS_FOLDERS` in `download_data.py` once you have the links.

---

## Step 5 — Ingest Curriculum Documents (มคอ.2)

```bash
# บางเขน campus (default)
uv run kuru-ingest-mko

# Specific campus
uv run kuru-ingest-mko กำแพงแสน
uv run kuru-ingest-mko ศรีราชา
```

For each document, the pipeline:
1. Skips ภาคผนวก (appendix) subfolders and DOCX files when a same-stem PDF exists
2. Extracts text with PyMuPDF first; low-yield pages use Typhoon page OCR; fully scanned PDFs use `OCR_MODEL`
3. Chunks text into ~2,000-char segments tagged by section type (`plo` / `course` / `general`)
4. Embeds each chunk with local `multilingual-e5-base` and upserts into Supabase
5. Extracts PLOs via Gemini and writes to Neo4j (skipped if Neo4j not configured)
6. Updates the program's `coverage` field in the `programs` table

**OCR and cost tracking:** `OCR_MODEL` defaults to direct Gemini `gemini-2.5-flash`, which uses `GEMINI_API_KEY` only for PDFs classified as fully scanned. Low-yield pages normally use Typhoon and will not show up as Gemini spend. Use `OCR_MODEL=google/gemini-2.5-flash` only when you intentionally want full-PDF OCR routed through OpenRouter.

After ingestion, check coverage:
```bash
uv run kuru-coverage
```

---

## Step 6 — Populate English Program Names

```bash
uv run kuru-coverage --populate-names data/program_name_mapping.csv
```

Uploads English names from the CSV to the `programs` table. Required for English-language queries like "Computer Engineering courses" to resolve to the correct program. The CSV is pre-filled for all currently ingested บางเขน programs — add rows for new campuses as you ingest them.

---

## Step 7 — Ingest TCAS Data

```bash
uv run kuru-ingest-tcas
```

Processes TCAS PDFs and xlsx spreadsheets from `data/native/tcas/`. Extracts structured records (quotas, GPAX minimums, exam weights, deadlines) into the `tcas_records` table. Currently covers round1 and round3 for บางเขน programs.

---

## Step 8 — Run the Chatbot

```bash
uv run kuru-demo
```

Interactive CLI. Type `samples` to see example queries, `q` or `exit` to quit.

The embedding model loads on startup (~5 seconds). First query after a cold start may take 2–3 seconds longer.

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `KeyError: *_API_KEY` | `.env` missing or not loaded | Check `.env` file exists in project root, or pass the backend `.env` path explicitly in scripts |
| gdown download fails | Drive folder not public | Set folder to "Anyone with the link can view" |
| `match_chunks RPC not found` | Schema not applied | Run `uv run kuru-setup-db` |
| Queries return wrong program | `name_en` not populated | Run `kuru-coverage --populate-names` |
| CPE / other program chunks missing | IVFFlat probes too low | `kuru-setup-db` re-applies the function with `probes=50` — run it |
| Neo4j `ServiceUnavailable` | AuraDB Free pauses after 3 days idle | Resume at [console.neo4j.io](https://console.neo4j.io) |
| Unexpected Gemini cost count | Low-yield pages used Typhoon, not Gemini OCR | Check `coverage.extraction_method` for `pymupdf+typhoon_pages` and review Typhoon usage |
| `choices=None` / OCR garbage | OCR model struggled with a poor scan | Re-run the affected file with explicit `OCR_MODEL=gemini-2.5-flash` or a stronger routed model |
| Thai text garbled in terminal | Windows console encoding | Set `PYTHONUTF8=1` environment variable |
