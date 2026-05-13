# Handoff Notes - KUru AI-Enabled Project (updated POC status)

Date: 13 May 2026

These notes summarize the current status, alignments with course criteria, and next actions after the ingestion cleanup, v7 retrieval benchmark, and v8 structured fee/TCAS regression benchmark.

## Project summary

- **Project:** KUru - KU Curriculum & PLO Navigator
- **Core AI approach:** RAG pipeline (embed -> retrieve -> generate)
- **Backend:** FastAPI + Supabase pgvector + Gemini Flash Lite through OpenRouter
- **Frontend:** React chat UI with source citations and thumbs feedback

## Current status

### Completed/available

- **Corpus cleanup complete:** 57 Bangkhen program records and 13,910 chunks after duplicate cleanup.
- **Source layout current:** curriculum PDFs live in `pipeline/data/scanned/curriculum`; TCAS native PDF/XLSX files live in `pipeline/data/native/tcas`.
- **Selected latest production model:** v8 structured RAG (`v7` targeted rerank + TCAS relink + structured fee grounding + Thai/English response policy).
- **Headline retrieval eval:** v7 targeted lexical rerank, 74% good answers, 2.26 / 3.0 average score.
- **Structured regression eval:** v8 fee/TCAS suite, 72.7% good answers, 2.055 / 3.0 average score, MLflow run `8a47e44b6c034bbcb83f697ecfdfe603`.
- **MLflow store:** `pipeline/mlflow.db` (`sqlite:///mlflow.db` from the `pipeline/` directory). Historical B2 runs and v1-v8 eval runs are recorded under `kuru-rag-hyperparameter-search`.
- **B3 fairness findings:** documented as section-type/data-coverage disparity analysis.
- **B4 guide:** `pipeline/docs/B4_MLflow_Run_and_Screenshots.md`.
- **B5/B6/B7 artifacts:** present; use `pipeline/docs/Part_B_alignment.md` as the current source-of-truth mapping.

### In progress / next up

- **B4 MLflow screenshots** captured under `pipeline/screenshots/mlflow/`.
- **B1 optional rerun/export** if final charts must reflect only the cleaned corpus snapshot.
- **Final notebook export** to PDF/HTML after the metrics are frozen.

## Criteria alignment

The submission plan in `pipeline/docs/poc_submission_plan.md` aligns with all required parts A/B/C.

Key watch-outs:

- **B2 training loop:** explain RAG ingestion + evaluation as the training/validation loop.
- **B5 explainability:** frame similarity scores, retrieved chunks, and source citations as the interpretable evidence path.
- **B7 model artifact:** current equivalent artifact is `backend/mlartifacts/MLmodel` plus `backend/mlartifacts/pipeline_config.json`; no separate `model.pkl` is required if the report explains this as the deployable RAG configuration artifact.
- **AI usage disclosure:** include it in the final report PDF.

## Next actions

1. **Capture MLflow screenshots (B4)**
   - Start UI in `pipeline/`:
     - `uv run mlflow ui --backend-store-uri sqlite:///mlflow.db --port 5000`
   - Capture:
     - Experiments list
     - Single run overview
     - Artifacts tab
     - Metrics/params comparison

2. **Review/export B5 explainability notebook**
   - File: `pipeline/notebooks/B5_explainability.ipynb`
   - Confirm the final export includes top retrieved evidence, similarity interpretation, and source attribution.

3. **Review/export B6 prediction reasoning notebook**
   - File: `pipeline/notebooks/B6_prediction_reasoning.ipynb`
   - Include 3 test cases with retrieved chunks, answer, and source mapping.

4. **Review/export B7 deployment notebook**
   - File: `pipeline/notebooks/B7_model_deployment.ipynb`
   - Artifact: `backend/mlartifacts/MLmodel` plus `backend/mlartifacts/pipeline_config.json`.

## Known issues / risks

- DVM currently has 0 chunks after an interrupted retry and needs a dedicated long run or separate OCR policy.
- Dense tables remain the main quality bottleneck; table-aware extraction/backfill is the highest-impact next improvement.
- B4 screenshots are captured; make sure they are included in the final PDF/slide package.
- The system is still below the 80% target: v7 headline is 74%; v8 structured regression is 72.7%.

## Helpful file map

- **Criteria:** `pipeline/docs/poc_criteria.md`
- **Plan:** `pipeline/docs/poc_submission_plan.md`
- **Current Part B alignment:** `pipeline/docs/Part_B_alignment.md`
- **Eval history:** `pipeline/docs/eval_results.md`
- **Current ingestion state:** `pipeline/docs/current-ingestion-state.md`
- **B2 notebook:** `pipeline/notebooks/B2_model_training.ipynb`
- **B5 notebook:** `pipeline/notebooks/B5_explainability.ipynb`
- **B6 notebook:** `pipeline/notebooks/B6_prediction_reasoning.ipynb`
- **B7 notebook:** `pipeline/notebooks/B7_model_deployment.ipynb`
- **Figures:** `pipeline/docs/figures/`

## Minimal environment notes

- If packages are missing, add via `uv add ragas datasets mlflow`.
- Eval judge uses Gemini/OpenRouter through the current pipeline configuration.

---

This handoff is now a compatibility note. Treat `pipeline/docs/Part_B_alignment.md`, `pipeline/docs/eval_results.md`, and `pipeline/docs/current-ingestion-state.md` as the current operational source of truth.
