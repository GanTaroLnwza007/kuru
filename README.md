# KUru — AI Academic Advisor for Kasetsart University

Thai-first bilingual chatbot that answers questions about KU programs, TCAS admission, and curriculum using RAG over มคอ.2 PDFs and TCAS structured data.

## Repository structure

```
kuru/
├── frontend/    Next.js 14 — chat UI, RIASEC test, Program Explorer
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
```

---

## Credentials

Ask the project owner for these values and put them in `backend/.env`:

```env
GEMINI_API_KEY=...      # Gemini API — LLM generation + OCR
SUPABASE_URL=...        # https://your-project.supabase.co
SUPABASE_KEY=...        # Supabase anon or service-role key
```

Neo4j and Redis are optional — leave them blank.

---

## Running

```bash
# Terminal 1 — backend (http://localhost:8000)
cd backend
uv run uvicorn main:app --reload

# Terminal 2 — frontend (http://localhost:3000)
cd frontend
npm run dev
```

> **Windows — "trampoline failed" error?** Recreate the venv:
> ```powershell
> Remove-Item -Recurse -Force .venv; uv sync
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

See `pipeline/CLAUDE.md` for full architecture and ingestion details.

---

## Data (already ingested — no action needed)

The Supabase database is shared. It already contains:
- **34 programs** from บางเขน campus (~9,300 vector chunks)
- **2,524 TCAS records** (Round 1 + Round 3)

---

## Docs

- [`docs/explorer-data-guide.md`](docs/explorer-data-guide.md) — DB fields, API endpoints, what needs to be filled in for the Explorer page
- [`pipeline/CLAUDE.md`](pipeline/CLAUDE.md) — RAG architecture, ingestion commands, known issues
- [`backend/README.md`](backend/README.md) — Backend-specific setup and commands
- [`frontend/README.md`](frontend/README.md) — Frontend architecture and component guide
