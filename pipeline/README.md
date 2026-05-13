# KUru Pipeline - RAG, Evaluation, and POC Evidence

This folder contains the RAG engine, ingestion pipeline, evaluation scripts, MLflow tracking store, notebooks, and POC documentation.

## Grader Navigation

| Rubric item | Path |
|-------------|------|
| Part A report | `docs/Part_A_report.md` |
| Part B alignment checklist | `docs/Part_B_alignment.md` |
| B1 data exploration | `notebooks/B1_data_exploration.ipynb` |
| B2 training/evaluation | `notebooks/B2_model_training.ipynb` |
| B3 fairness | `notebooks/B2_model_training.ipynb`, `docs/figures/B3_fairness_heatmap.png` |
| B4 MLflow screenshots | `screenshots/mlflow/` |
| B4 MLflow store | `mlflow.db` |
| B5 explainability | `notebooks/B5_explainability.ipynb` |
| B6 prediction reasoning | `notebooks/B6_prediction_reasoning.ipynb`, `data/b6_case*.json` |
| B7 deployment notebook | `notebooks/B7_model_deployment.ipynb` |
| Part C interface contract/testing | `docs/C2_interface_contract.md`, `docs/C3_interface_testing.md` |

## Current Model Story

Selected/latest production model: **v8 structured RAG**.

It combines:

- v7 targeted lexical rerank retrieval
- TCAS records relinked to canonical program IDs
- structured fee grounding through `programs.fees`
- Thai/English response policy fixes

Important MLflow runs:

| Run | Result | Meaning |
|-----|--------|---------|
| `latest_submission_headline_v7_rerank_74pct` | 74% good, 2.26 / 3.0 | Headline retrieval benchmark |
| `v8_structured_tcas_fees` | 72.7% good, 2.055 / 3.0 | Selected production regression suite |
| `v7_filtered_rerank_stress` | 62% good, 1.92 / 3.0 | Harder stress benchmark |

## MLflow

Open B4 evidence:

```powershell
cd pipeline
uv run mlflow ui --backend-store-uri sqlite:///mlflow.db --port 5000
```

Then visit:

```text
http://localhost:5000
```

Captured screenshots:

```text
screenshots/mlflow/B4_mlflow_experiments_list.png
screenshots/mlflow/B4_mlflow_metrics_comparison.png
screenshots/mlflow/B4_mlflow_run_overview.png
screenshots/mlflow/B4_mlflow_artifacts.png
```

## Evaluation Commands

Run the selected structured regression eval:

```powershell
$env:PYTHONUTF8=1
uv run python scripts/run_eval.py `
  --eval data/eval_set_v8_structured.csv `
  --out data/eval_results_v8_structured.csv `
  --delay 0.2 `
  --mlflow `
  --run-name v8_structured_tcas_fees
```

Backfill existing eval CSVs into MLflow:

```powershell
uv run python scripts/log_eval_results_to_mlflow.py
```

## Ingestion Commands

Most graders do **not** need to re-ingest because the shared Supabase database is already populated. For reference:

```powershell
uv run kuru-download --tcas-only
uv run kuru-scrape-curriculum
uv run kuru-ingest-mko
uv run kuru-ingest-tcas
```

Current source layout:

```text
data/scanned/curriculum/   registrar curriculum PDFs
data/native/tcas/          TCAS native PDFs/XLSX from Google Drive
```

Operational details: `docs/current-ingestion-state.md`.

## Package Setup

```powershell
cd pipeline
uv sync
```

This package is installed into the backend with:

```powershell
cd ../backend
uv pip install -e ../pipeline
```
