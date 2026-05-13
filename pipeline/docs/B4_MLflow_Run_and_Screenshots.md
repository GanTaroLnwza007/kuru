# B4 - MLflow Tracking Evidence

Date: 2026-05-13

This note records where the B4 experiment tracking evidence lives and what still needs to be captured for the final PDF/slide submission.

## MLflow Run Store

Tracking data is stored under:

```text
pipeline/notebooks/mlruns/
```

The B2 notebook logs the experiment as `kuru-rag-hyperparameter-search` and records three retrieval configurations:

| Run | top_k | min_similarity | Purpose |
|-----|-------|----------------|---------|
| baseline | 5 | 0.35 | Production-style default retrieval |
| wider_retrieval | 8 | 0.30 | Wider context window for more candidate chunks |
| strict_threshold | 5 | 0.45 | Higher precision filter |

The saved comparison figure is:

```text
pipeline/docs/figures/B2_experiment_comparison.png
```

## How to Reopen the UI

From `pipeline/`:

```powershell
uv run mlflow ui --backend-store-uri ./notebooks/mlruns --port 5000
```

Then open:

```text
http://localhost:5000
```

## Screenshots To Capture

Save these in `pipeline/docs/figures/`:

| Screenshot | Filename |
|------------|----------|
| Experiment list | `B4_mlflow_experiments_list.png` |
| Run comparison table | `B4_mlflow_metrics_comparison.png` |
| Single best run overview | `B4_mlflow_run_overview.png` |
| Best run artifacts tab | `B4_mlflow_artifacts.png` |

## Current Alignment Note

The historical B2 MLflow runs compare earlier retrieval settings and are valid for B4 experimentation evidence. The current submission baseline after later ingestion cleanup and targeted lexical reranking is documented in `pipeline/docs/eval_results.md` as v7: 74% good answers and 2.26 / 3.0 average score.
