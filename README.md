# KUru — AI Academic Advisor for Kasetsart University

Thai-first bilingual chatbot that answers questions about KU programs, TCAS admission, and curriculum using RAG over มคอ.2 PDFs and TCAS structured data.

## Repository structure

KUru is split across two sibling repositories that **must** live in the same parent folder:

```
parent/
├── kuru/           ← this repo  (Next.js frontend + FastAPI backend)
└── kuru-pipeline/  ← RAG engine (embeddings, vector DB, Gemini generation)
```

The backend's Python environment pulls `kuru-pipeline` as a local editable dependency (`../../kuru-pipeline`), so the relative path must be exact.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.12+ | [python.org](https://python.org) |
| uv | latest | `pip install uv` |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm | 9+ | bundled with Node |

---

## 1 — Clone both repos

```bash
git clone <kuru-pipeline-url> kuru-pipeline
git clone <kuru-url>          kuru
```

Both folders must share the same parent directory.

---

## 2 — Backend setup

```bash
cd kuru/backend

# Install Python dependencies (includes kuru-pipeline from ../../kuru-pipeline)
uv sync

# Create .env from the example
cp .env.example .env
```

Edit `.env` and fill in:

```env
GEMINI_API_KEY=...      # Gemini API key (for LLM generation + OCR)
SUPABASE_URL=...        # https://your-project.supabase.co
SUPABASE_KEY=...        # Supabase anon or service-role key
```

The `SUPABASE_URL` and `SUPABASE_KEY` values are the same ones used in `kuru-pipeline/.env`.

> **Neo4j / Redis** are optional — leave them blank. The chatbot works without them.

### Start the backend

```bash
uv run uvicorn main:app --reload
```

> **Windows — "trampoline failed" error?** Delete and recreate the venv:
> ```powershell
> Remove-Item -Recurse -Force .venv; uv sync
> ```

The API will be available at `http://localhost:8000`. Verify with:

```bash
curl http://localhost:8000/api/v1/health
```

---

## 3 — Frontend setup

```bash
cd kuru/frontend

# Install dependencies
npm install

# Create local env file
cp .env.example .env.local
```

`.env.local` should contain:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_USE_MOCK=false
```

### Start the frontend

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## 4 — Data (already ingested)

The Supabase database is shared — you **do not** need to re-ingest. The vector DB already contains:

- **33 programs** from บางเขน campus (~9,300 chunks)
- **2,524 TCAS records** (Round 1 + Round 3)

If you need to re-ingest or add data, see `kuru-pipeline/CLAUDE.md` for ingestion commands.

---

## Credentials

Ask the project owner for the shared `.env` values:

- `GEMINI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_KEY`

Do not commit `.env` or `.env.local` files — they are gitignored.

---

## Quick-start summary

```bash
# Terminal 1 — backend
cd kuru/backend
uv sync
cp .env.example .env   # fill in credentials
uv run uvicorn main:app --reload

# Terminal 2 — frontend
cd kuru/frontend
npm install
cp .env.example .env.local
npm run dev
```

Then open `http://localhost:3000`.
