# B4 - MLflow Tracking Evidence

Date: 2026-05-13

This note records where the B4 experiment tracking evidence lives and which screenshots are ready for the final PDF/slide submission.

## MLflow Run Store

Tracking data is stored under:

```text
pipeline/mlflow.db
```

Open it from `pipeline/` with backend URI `sqlite:///mlflow.db`.

The experiment name is `kuru-rag-hyperparameter-search`. It now contains:

- the original three B2 retrieval configurations, and
- backfilled/current eval runs for v1-v8, including the v8 structured fee/TCAS regression run.

The original B2 notebook retrieval configurations are:

| Run | top_k | min_similarity | Purpose |
|-----|-------|----------------|---------|
| baseline | 5 | 0.35 | Production-style default retrieval |
| wider_retrieval | 8 | 0.30 | Wider context window for more candidate chunks |
| strict_threshold | 5 | 0.45 | Higher precision filter |

The saved comparison figure is:

```text
pipeline/docs/figures/B2_experiment_comparison.png
```

Important current eval runs:

| Run | Eval set | Result | Note |
|-----|----------|--------|------|
| `latest_submission_headline_v7_rerank_74pct` | `data/eval_set_v6_current_chunks.csv` | 74% good, 2.26 / 3.0 | Latest screenshot-friendly copy of the headline current retrieval benchmark after the v7 lexical rerank code path |
| `v7_filtered_rerank_stress` | `data/eval_set_v7_filtered_current_chunks.csv` | 62% good, 1.92 / 3.0 | Harder filtered stress set; not a same-set regression |
| `v8_structured_tcas_fees` | `data/eval_set_v8_structured.csv` | 72.7% good, 2.055 / 3.0 | Selected/latest production regression suite including fees and TCAS |

## How to Reopen the UI

From `pipeline/`:

```powershell
uv run mlflow ui --backend-store-uri sqlite:///mlflow.db --port 5000
```

Then open:

```text
http://localhost:5000
```

## Screenshot Evidence

Captured screenshots are stored in:

```text
pipeline/screenshots/mlflow/
```

| Screenshot | File | Status |
|------------|------|--------|
| Experiment list / run table | `pipeline/screenshots/mlflow/B4_mlflow_experiments_list.png` | Captured |
| Metrics comparison charts | `pipeline/screenshots/mlflow/B4_mlflow_metrics_comparison.png` | Captured |
| Headline run overview | `pipeline/screenshots/mlflow/B4_mlflow_run_overview.png` | Captured |
| Headline run artifacts tab | `pipeline/screenshots/mlflow/B4_mlflow_artifacts.png` | Captured |

## Current Alignment Note

The historical B2 MLflow runs compare earlier retrieval settings and are valid for B4 experimentation evidence. The current headline retrieval benchmark after later ingestion cleanup and targeted lexical reranking is logged as `latest_submission_headline_v7_rerank_74pct`: 74% good answers and 2.26 / 3.0 average score. The selected/latest production behavior is represented by `v8_structured_tcas_fees`, because that run includes the fee and TCAS fixes needed for real frontend use. The lower `v7_filtered_rerank_stress` score comes from a harder filtered eval set, not from a same-set quality drop.
