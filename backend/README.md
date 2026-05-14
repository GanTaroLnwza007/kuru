# KUru Backend - B7 Model Service

This folder contains the FastAPI service used for **B7: Model Deployment as a Service**. The backend wraps the real RAG engine from `../pipeline` and exposes it through REST endpoints consumed by the frontend.

## What Graders Should Look At

| Item | Path / endpoint | Why it matters |
|------|-----------------|----------------|
| Main model endpoint | `POST /api/v1/chat` | B7 deployed model inference |
| Feedback endpoint | `POST /api/v1/chat/feedback` | A2.4/C1 feedback loop |
| Program endpoints | `GET /api/v1/programs`, `GET /api/v1/programs/{identifier}` | Program Explorer data |
| API schema models | `models/schemas.py` | Request/response contract |
| Route implementation | `api/v1/chat.py` | RAG call, source citations, confidence level |
| Model artifact | `mlartifacts/MLmodel`, `mlartifacts/pipeline_config.json` | B7 MLflow-model-equivalent artifact |

The full UI-model contract is documented in `../pipeline/docs/C2_interface_contract.md`.

## Setup

```powershell
cd backend
uv sync
uv pip install -e ../pipeline
Copy-Item .env.example .env
```

`../pipeline` is required. Without this editable install, `kuru.rag.query_engine` is not importable and the chat endpoint falls back to a low-confidence stub.

The backend warms up `intfloat/multilingual-e5-base` during FastAPI startup. This
model is public, so a Hugging Face API key is not required. The first local or
Railway startup may take longer while the ~1.1 GB model is downloaded and cached
under the Hugging Face cache directory. Add `HUGGINGFACE_HUB_TOKEN` only if you
switch to a private/gated Hugging Face model or hit anonymous download limits.

Fill `backend/.env`:

```env
SUPABASE_URL=...
SUPABASE_KEY=...
OPENROUTER_API_KEY=...
GEMINI_API_KEY=...
TYPHOON_API_KEY=...
```

## Run

```powershell
uv run uvicorn main:app --reload --port 8000
```

The API will be available at:

```text
http://localhost:8000/api/v1
```

Health check:

```powershell
curl http://localhost:8000/api/v1/health
```

Expected shape:

```json
{
  "status": "ok",
  "rag": {
    "available": true,
    "ready": true,
    "error": null
  }
}
```

## B7 Example Request

```powershell
$body = @{
  message = "software and knowledge engineering เข้ายังไง"
  session_id = "grader-demo"
  conversation_history = @()
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
  -Uri "http://localhost:8000/api/v1/chat" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Expected response shape:

```json
{
  "data": {
    "answer": "...",
    "session_id": "grader-demo",
    "confidence_level": "high",
    "sources": [
      {
        "source_file": "...",
        "section_type": "tcas",
        "similarity": 0.86
      }
    ],
    "used_tcas_data": true
  },
  "sources": [],
  "error": null
}
```

## Useful Test Questions

| Question | Expected behavior |
|----------|-------------------|
| `software and knowledge engineering เข้ายังไง` | Thai answer, TCAS/admission grounding |
| `ค่าเทอมของบัญชีบัณฑิตนานาชาติ` | Structured fee answer from `programs.fees` |
| `ค่าเทอมของวิศวกรรมซอฟต์แวร์` | Missing fee data, no borrowed tuition hallucination |
| `What are the PLOs for Computer Engineering?` | English answer with curriculum/PLO sources |

## Development Commands

```powershell
uv run black .
uv run ruff check .
uv run mypy .
```

Windows stale venv fix:

```powershell
Remove-Item -Recurse -Force .venv
uv sync
uv pip install -e ../pipeline
uv run uvicorn main:app --reload --port 8000
```
