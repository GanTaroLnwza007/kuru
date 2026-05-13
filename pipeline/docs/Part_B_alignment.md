# Part B Alignment Check

Date: 2026-05-13

This file maps the official Part B criteria to the current KUru artifacts after the ingestion cleanup, v7 retrieval evaluation, and v8 structured fee/TCAS regression evaluation.

## Source of Truth

- Current corpus: 57 Bangkhen program records, 13,910 chunks.
- Selected latest production model: v8 structured RAG (`v7` targeted lexical rerank + TCAS relink + structured fee grounding + Thai/English response policy).
- Current query defaults: `top_k=5`, `MIN_SIMILARITY=0.35`, IVFFlat `probes=10`, fetch multiplier `3`.
- Current generator: `google/gemini-2.5-flash-lite` through OpenRouter.
- Current headline retrieval eval: v7 targeted lexical rerank, 74% good answers, 2.26 / 3.0 average score.
- Current stress eval: v7 filtered current-chunk stress set, 62% good answers, 1.92 / 3.0 average score. This is a harder eval set, not a same-set regression.
- Current structured regression eval: v8 fee/TCAS suite, 72.7% good answers, 2.055 / 3.0 average score, MLflow run `8a47e44b6c034bbcb83f697ecfdfe603`.
- MLflow tracking store: `pipeline/mlflow.db` (`sqlite:///mlflow.db` from the `pipeline/` directory).

## Deliverable Map

| Criteria | Artifact | Status | Alignment note |
|----------|----------|--------|----------------|
| B1 input data exploration | `pipeline/notebooks/B1_data_exploration.ipynb` | Present | Notebook has saved exploratory outputs. Header now notes the cleaned 57-program / 13,910-chunk corpus; rerun before final export if fresh charts are required. |
| B2 training implementation | `pipeline/notebooks/B2_model_training.ipynb` | Present | Frames RAG ingestion/eval as the training loop; includes preprocessing, architecture, hyperparameters, validation, MLflow logging, and results analysis. |
| B3 fairness analysis | `pipeline/notebooks/B2_model_training.ipynb`, `pipeline/docs/figures/B3_fairness_heatmap.png` | Present | Implemented as section-type/data-coverage disparity analysis, which is the relevant fairness axis for curriculum-document retrieval. |
| B4 versioning and experimentation | `pipeline/mlflow.db`, `pipeline/screenshots/mlflow/`, `pipeline/docs/B4_MLflow_Run_and_Screenshots.md` | Present | SQLite MLflow store contains historical experiment runs plus v1-v8 eval runs; four MLflow UI screenshots are captured for submission evidence. |
| B5 explainability | `pipeline/notebooks/B5_explainability.ipynb`, B5 section in `B2_model_training.ipynb` | Present | Standalone wrapper added so the rubric can find B5 directly; detailed executable cells remain in B2. |
| B6 prediction reasoning | `pipeline/notebooks/B6_prediction_reasoning.ipynb`, `pipeline/data/b6_case*.json` | Present | Shows three cases with evidence, retrieval funnel, source attribution, and non-technical reasoning. |
| B7 deployment as service | `pipeline/notebooks/B7_model_deployment.ipynb`, `backend/mlartifacts/MLmodel`, `backend/mlartifacts/pipeline_config.json` | Present | Model artifact metadata represents the selected v8 structured RAG pipeline: v7 retrieval settings plus TCAS/fee grounding behavior. |

## Conceptual Notes

- Part B should describe this as a RAG system, not a conventional supervised classifier. The "training" surface is corpus preparation, chunking, embedding, vector indexing, retrieval hyperparameters, reranking, and LLM-as-judge validation.
- Fairness is not demographic fairness here. The relevant bias is coverage disparity: programs or section types with sparse/OCR-noisy/table-heavy chunks receive worse answers.
- B4 MLflow now includes both historical experiment evidence and current eval records. Treat `latest_submission_headline_v7_rerank_74pct` as the 74% headline retrieval benchmark, `v7_filtered_rerank_stress` as a harder stress benchmark, and `v8_structured_tcas_fees` as the selected/latest production regression benchmark that includes fees and TCAS.
- B7 uses an equivalent artifact rather than a heavyweight `model.pkl`: `MLmodel` plus `pipeline_config.json` declare the deployable RAG pipeline, external vector DB, local embedding model, and generation provider.

## Remaining Submission Work

1. Rerun/export B1 if the final PDF must show only post-cleanup charts instead of the earlier exploratory snapshot.
2. Export notebooks to PDF/HTML after the final eval numbers are frozen.
