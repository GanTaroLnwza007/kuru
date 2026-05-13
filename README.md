# KUru — AI Academic Advisor for Kasetsart University

Thai-first bilingual chatbot that answers questions about KU programs, TCAS admission, and curriculum using RAG over มคอ.2 PDFs and TCAS structured data.

## Repository structure

```
kuru/
├── frontend/    Next.js 16 — chat UI, RIASEC test, Program Explorer
├── backend/     FastAPI — chat, programs, feedback endpoints
└── pipeline/    RAG engine — PDF ingestion, embeddings, Gemini generation
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.12+ | [python.org](https://python.org) |
| uv | latest | `pip install uv` |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |

---

## Setup

### 1. Backend

```bash
cd backend
uv sync
uv pip install -e ../pipeline   # enables the real RAG engine in FastAPI
cp .env.example .env   # fill in credentials (see below)
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
```

`.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_USE_MOCK_CHAT=false
```

---

## Credentials

Ask the project owner for these values and put them in `backend/.env`:

```env
GEMINI_API_KEY=...        # Structured extraction + direct Gemini OCR
OPENROUTER_API_KEY=...    # RAG answer generation
TYPHOON_API_KEY=...       # Optional page OCR fallback
SUPABASE_URL=...          # https://your-project.supabase.co
SUPABASE_KEY=...          # Supabase service-role key
```

Neo4j and Redis are optional — leave them blank.

---

## Running

```bash
# Terminal 1 — backend (http://localhost:8000)
cd backend
uv run uvicorn main:app --reload --port 8000

# Terminal 2 — frontend (http://localhost:3000)
cd frontend
npm run dev
```

> **Windows — "trampoline failed" error?** Recreate the venv:
> ```powershell
> Remove-Item -Recurse -Force .venv
> uv sync
> uv pip install -e ../pipeline
> ```

Health check: `curl http://localhost:8000/api/v1/health`

---

## Pipeline (RAG / ingestion)

The `pipeline/` folder contains the RAG engine used by the backend and the data ingestion scripts.

```bash
cd pipeline
uv run kuru-download        # Download PDFs from Google Drive
uv run kuru-setup-db        # Create Supabase tables
uv run kuru-ingest-mko      # Ingest curriculum PDFs (บางเขน)
uv run kuru-ingest-tcas     # Ingest TCAS admission PDFs
uv run kuru-demo            # Interactive RAG CLI for testing
```

See `pipeline/docs/current-ingestion-state.md` and `pipeline/docs/ingestion-guide.md` for current architecture and ingestion details.

---

## Data (already ingested — no action needed)

The Supabase database is shared. It already contains:
- **57 cleaned Bangkhen program records** with **13,910 vector chunks**
- **2,524 TCAS records** (Round 1 + Round 3)

---

## Docs

- [`pipeline/docs/explorer-data-guide.md`](pipeline/docs/explorer-data-guide.md) — DB fields, API endpoints, what needs to be filled in for the Explorer page
- [`pipeline/docs/current-ingestion-state.md`](pipeline/docs/current-ingestion-state.md) — current RAG corpus and ingestion status
- [`backend/README.md`](backend/README.md) — Backend-specific setup and commands
- [`frontend/README.md`](frontend/README.md) — Frontend architecture and component guide
