"""Log existing eval result CSVs to the local MLflow SQLite store.

This is useful after running evaluations before MLflow logging was added to
scripts/run_eval.py.

Usage:
    uv run python scripts/log_eval_results_to_mlflow.py
    uv run python scripts/log_eval_results_to_mlflow.py --force
"""

from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path

import mlflow

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

DATA_DIR = Path("data")
TRACKING_URI = "sqlite:///mlflow.db"
EXPERIMENT = "kuru-rag-hyperparameter-search"

EVAL_SET_BY_RESULT = {
    "eval_results.csv": "eval_set.csv",
    "eval_results_exp1.csv": "eval_set.csv",
    "eval_results_exp2.csv": "eval_set.csv",
    "eval_results_exp3.csv": "eval_set.csv",
    "eval_results_v2.csv": "eval_set_v2.csv",
    "eval_results_v3.csv": "eval_set_v2.csv",
    "eval_results_v4_after_cleanup.csv": "eval_set_v2.csv",
    "eval_results_v5_after_remap_retrieval_fix.csv": "eval_set_v3_after_cleanup.csv",
    "eval_results_v6_current_chunks.csv": "eval_set_v6_current_chunks.csv",
    "eval_results_v7_filtered_rerank.csv": "eval_set_v7_filtered_current_chunks.csv",
    "eval_results_v8_structured.csv": "eval_set_v8_structured.csv",
}

RUN_NAME_BY_RESULT = {
    "eval_results.csv": "v1_baseline_unscoped",
    "eval_results_exp1.csv": "baseline",
    "eval_results_exp2.csv": "wider_retrieval",
    "eval_results_exp3.csv": "strict_threshold",
    "eval_results_v2.csv": "v2_program_named_eval",
    "eval_results_v3.csv": "v3_full_pdf_reingest",
    "eval_results_v4_after_cleanup.csv": "v4_ingestion_cleanup",
    "eval_results_v5_after_remap_retrieval_fix.csv": "v5_remap_retrieval_fix",
    "eval_results_v6_current_chunks.csv": "latest_submission_headline_v7_rerank_74pct",
    "eval_results_v7_filtered_rerank.csv": "v7_filtered_rerank_stress",
    "eval_results_v8_structured.csv": "v8_structured_tcas_fees",
}


def _valid_scores(rows: list[dict]) -> list[int]:
    scores: list[int] = []
    for row in rows:
        raw = str(row.get("score", ""))
        if raw.lstrip("-").isdigit():
            score = int(raw)
            if score >= 0:
                scores.append(score)
    return scores


def _metrics(rows: list[dict]) -> dict[str, float]:
    scores = _valid_scores(rows)
    if not scores:
        return {}
    dist = {score: scores.count(score) for score in range(4)}
    metrics: dict[str, float] = {
        "avg_score": round(sum(scores) / len(scores), 3),
        "pct_good": round((dist[2] + dist[3]) / len(scores) * 100, 1),
        "n_valid": float(len(scores)),
        "n_errors": float(len(rows) - len(scores)),
        "n_score_3": float(dist[3]),
        "n_score_2": float(dist[2]),
        "n_score_1": float(dist[1]),
        "n_score_0": float(dist[0]),
    }

    by_type: dict[str, list[int]] = {}
    for row in rows:
        raw = str(row.get("score", ""))
        if raw.lstrip("-").isdigit() and int(raw) >= 0:
            by_type.setdefault(row.get("question_type") or "unknown", []).append(int(raw))
    for question_type, type_scores in sorted(by_type.items()):
        metrics[f"avg_score_{question_type}"] = round(sum(type_scores) / len(type_scores), 3)
        metrics[f"n_{question_type}"] = float(len(type_scores))

    return metrics


def _existing_run_names(experiment_id: str) -> set[str]:
    runs = mlflow.search_runs([experiment_id], output_format="list")
    return {run.data.tags.get("mlflow.runName", "") for run in runs}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="log even if a run with the same name already exists")
    args = parser.parse_args()

    mlflow.set_tracking_uri(TRACKING_URI)
    mlflow.set_experiment(EXPERIMENT)
    experiment = mlflow.get_experiment_by_name(EXPERIMENT)
    if experiment is None:
        raise SystemExit(f"MLflow experiment not found: {EXPERIMENT}")

    existing_names = _existing_run_names(experiment.experiment_id)
    result_files = sorted(DATA_DIR.glob("eval_results*.csv"))
    logged = 0
    skipped = 0

    for csv_path in result_files:
        run_name = RUN_NAME_BY_RESULT.get(csv_path.name, csv_path.stem)
        if run_name in existing_names and not args.force:
            print(f"skip existing: {run_name}")
            skipped += 1
            continue

        with csv_path.open(encoding="utf-8") as f:
            rows = list(csv.DictReader(f))
        metrics = _metrics(rows)
        if not metrics:
            print(f"skip no scores: {csv_path}")
            skipped += 1
            continue

        eval_set = DATA_DIR / EVAL_SET_BY_RESULT.get(csv_path.name, "")

        with mlflow.start_run(run_name=run_name) as run:
            mlflow.log_params({
                "eval_results_csv": str(csv_path),
                "eval_set": str(eval_set) if eval_set.exists() else "",
                "n_rows": len(rows),
                "source": "backfill_existing_eval_csv",
                "generator_model": "google/gemini-2.5-flash-lite",
                "judge": "llm_as_judge_0_to_3",
            })
            mlflow.log_metrics(metrics)
            mlflow.log_artifact(str(csv_path), artifact_path="eval_results")
            if eval_set.exists():
                mlflow.log_artifact(str(eval_set), artifact_path="eval_set")
            print(
                f"logged {run_name}: run_id={run.info.run_id} "
                f"avg={metrics['avg_score']:.2f} good={metrics['pct_good']:.1f}%"
            )
            logged += 1

    print(f"\nlogged={logged} skipped={skipped} tracking_uri={TRACKING_URI}")


if __name__ == "__main__":
    main()
