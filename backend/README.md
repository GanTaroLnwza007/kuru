# KUru Backend

FastAPI backend for the KUru AI program navigator.

## Prerequisites

- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (`pip install uv`)

## Setup

```bash
uv sync
uv pip install -e ../pipeline
cp .env.example .env
# Fill in .env with your credentials
```

`../pipeline` is the local RAG package. Without this editable install, the chat endpoint
falls back to the non-RAG stub because `kuru.rag.query_engine` is not importable.

## Run

```bash
uv run uvicorn main:app --reload --port 8000
```

> **Windows — "trampoline failed" error?** Your `.venv` is stale. Recreate it:
> ```powershell
> Remove-Item -Recurse -Force .venv
> uv sync
> uv pip install -e ../pipeline
> uv run uvicorn main:app --reload --port 8000
> ```

The API will be available at `http://localhost:8000`.

## Lint

```bash
uv run black . && uv run ruff check .
```

## Type check

```bash
uv run mypy .
```

## Health check

```bash
curl http://localhost:8000/api/v1/health
```
