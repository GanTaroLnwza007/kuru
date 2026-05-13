# KUru - AI Academic Advisor for Kasetsart University

KUru is a Thai-first bilingual RAG chatbot for Kasetsart University program, curriculum, TCAS admission, and fee questions. It retrieves grounded evidence from ingested curriculum PDFs and structured TCAS/fee data, then answers through a FastAPI service used by the Next.js frontend.

## Quick Grader Map

| Rubric area | Where to look | Notes |
|-------------|---------------|-------|
| Part A design report | `pipeline/docs/Part_A_report.md` | AI system design, MAC objectives, FTA, monitoring, AI disclosure |
| B1 data exploration | `pipeline/notebooks/B1_data_exploration.ipynb` | Saved outputs and figures in `pipeline/docs/figures/` |
| B2 model training/eval | `pipeline/notebooks/B2_model_training.ipynb` | RAG-as-model training loop, preprocessing, hyperparameters, validation |
| B3 fairness | `pipeline/notebooks/B2_model_training.ipynb`, `pipeline/docs/figures/B3_fairness_heatmap.png` | Coverage/section disparity analysis |
| B4 MLflow | `pipeline/mlflow.db`, `pipeline/screenshots/mlflow/`, `pipeline/docs/B4_MLflow_Run_and_Screenshots.md` | Tracking runs and required screenshots |
| B5 explainability | `pipeline/notebooks/B5_explainability.ipynb` | Retrieved evidence and similarity interpretation |
| B6 prediction reasoning | `pipeline/notebooks/B6_prediction_reasoning.ipynb`, `pipeline/data/b6_case*.json` | Three individual reasoning examples |
| B7 deployed model service | `backend/`, `backend/mlartifacts/MLmodel`, `backend/mlartifacts/pipeline_config.json` | FastAPI service + equivalent MLflow model artifact |
| Part C interface | `pipeline/docs/C2_interface_contract.md`, `pipeline/docs/C3_interface_testing.md` | API contract, sequence diagram, test scenarios |

The current Part B source-of-truth checklist is `pipeline/docs/Part_B_alignment.md`.

## Selected Model and Scores

The selected/latest production behavior is **v8 structured RAG**:

```text
v7 targeted lexical rerank
+ TCAS program relinking
+ structured fee grounding
+ Thai/English response policy
```

Use these metrics in the report/demo:

| Benchmark | MLflow run | Result | Purpose |
|-----------|------------|--------|---------|
| Headline retrieval | `latest_submission_headline_v7_rerank_74pct` | 74% good, 2.26 / 3.0 | Main retrieval quality benchmark |
| Selected production regression | `v8_structured_tcas_fees` | 72.7% good, 2.055 / 3.0 | Realistic suite including fees and TCAS |
| Stress set | `v7_filtered_rerank_stress` | 62% good, 1.92 / 3.0 | Harder course-table-heavy stress benchmark |

## Directory Guide

```text
kuru/
|-- backend/                  FastAPI model service for B7
|   |-- api/v1/chat.py        POST /api/v1/chat and POST /api/v1/chat/feedback
|   |-- api/v1/programs.py    Program list/detail endpoints
|   |-- mlartifacts/          MLmodel + pipeline_config.json for B7
|   `-- README.md             Backend-specific setup and endpoint examples
|-- frontend/                 Next.js UI for chat, explorer, and student flows
|   `-- README.md             Frontend setup and architecture
|-- pipeline/                 RAG engine, ingestion, evaluation, MLflow, notebooks
|   |-- data/                 Eval CSVs and generated reasoning cases
|   |-- docs/                 Part A/B/C docs and handoff/status notes
|   |-- notebooks/            B1, B2, B5, B6, B7 notebooks
|   |-- screenshots/mlflow/   B4 MLflow evidence screenshots
|   |-- scripts/              Eval, backfill, cleanup, and migration scripts
|   `-- src/kuru/             RAG, ingestion, database, and CLI package
|-- requirements.txt          Grader-friendly Python dependency summary
`-- README.md                 This navigation guide
```

## B7 Endpoint to Test

The deployed model service is the FastAPI backend.

Start backend:

```powershell
cd backend
uv sync
uv pip install -e ../pipeline
uv run uvicorn main:app --reload --port 8000
```

Primary model endpoint:

```http
POST http://localhost:8000/api/v1/chat
Content-Type: application/json
```

Example request:

```json
{
  "message": "software and knowledge engineering เข้ายังไง",
  "session_id": "grader-demo",
  "conversation_history": []
}
```

Example response fields:

```json
{
  "data": {
    "answer": "...",
    "sources": [{ "source_file": "...", "section_type": "...", "similarity": 0.86 }],
    "confidence_level": "high",
    "used_tcas_data": true
  },
  "error": null
}
```

Other useful endpoints:

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/health` | Service health check |
| `POST /api/v1/chat` | B7 model inference endpoint |
| `POST /api/v1/chat/feedback` | User feedback collection |
| `GET /api/v1/programs` | Program explorer data |
| `GET /api/v1/programs/{identifier}` | Program detail with structured fields |

Full contract: `pipeline/docs/C2_interface_contract.md`.

## Setup

### Backend + RAG

```powershell
cd backend
uv sync
uv pip install -e ../pipeline
Copy-Item .env.example .env
```

Fill `backend/.env`:

```env
GEMINI_API_KEY=...
OPENROUTER_API_KEY=...
TYPHOON_API_KEY=...
SUPABASE_URL=...
SUPABASE_KEY=...
```

Run:

```powershell
uv run uvicorn main:app --reload --port 8000
```

### Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Set `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_USE_MOCK_CHAT=false
```

Open `http://localhost:3000`.

### MLflow B4 Evidence

```powershell
cd pipeline
uv run mlflow ui --backend-store-uri sqlite:///mlflow.db --port 5000
```

Open `http://localhost:5000`.

Screenshots are already captured in `pipeline/screenshots/mlflow/`.

## Data Status

The shared Supabase database currently contains:

- 57 cleaned Bangkhen program records
- 13,910 curriculum chunks
- 2,524 TCAS records
- Structured fee metadata in `programs.fees` where source-backed fee evidence exists

Operational ingestion status: `pipeline/docs/current-ingestion-state.md`.

## Notes for Grading

- This is a RAG system, so "training" means corpus preparation, chunking, embedding, vector indexing, retrieval hyperparameter selection, reranking, and LLM-as-judge validation.
- `backend/mlartifacts/MLmodel` and `backend/mlartifacts/pipeline_config.json` are the B7 model artifact equivalent for the deployed RAG pipeline.
- The best single endpoint to test the model is `POST /api/v1/chat`.
- The most grader-friendly route through the repo is: `Part_B_alignment.md` -> notebooks -> MLflow screenshots -> backend endpoint.
