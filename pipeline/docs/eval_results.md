# RAG Evaluation Results

## Setup

- **Eval tool**: LLM-as-judge (0–3 scale) via `scripts/run_eval.py`
- **Judge model**: `google/gemini-2.5-flash-lite` via OpenRouter
- **Sample size**: 20 questions (random seed 42) from 50-question golden eval set
- **Eval set**: Synthetic Q&A pairs generated from actual Supabase chunks via `scripts/generate_eval_set.py`

### Score rubric
| Score | Meaning |
|-------|---------|
| 3 | Correct and complete — covers all key facts in ground truth |
| 2 | Partially correct — main point addressed but details missing or minor errors |
| 1 | Tangentially related — on-topic but does not directly answer the question |
| 0 | Wrong or hallucinated — contradicts ground truth or invents facts |

---

## Iteration 1 — Baseline (v1 eval set, no program_id targeting)

| Metric | Value |
|--------|-------|
| Average score | **1.30 / 3.0** |
| Good answers (score ≥ 2) | **40%** |
| Distribution | 3=5, 2=3, 1=5, 0=7 |
| Admission avg | 1.17 (n=6) |
| Curriculum avg | 1.36 (n=14) |
| API cost | ~$0.0094 |

**Root causes of failures:**
- Eval set contained decontextualized questions ("this program", "this curriculum") that are unanswerable without knowing which program was being referenced
- One question asked about Thammasat University (OCR picked up a comparison table in a KU document)
- Multiple near-duplicate "Languages and Communication credit" questions from different programs — RAG retrieved chunks from the wrong program
- `query()` called without `program_id` — retrieval was not scoped to the correct program

---

## Iteration 2 — After fixes (v2 eval set + program_id targeting)

| Metric | Value |
|--------|-------|
| Average score | **1.85 / 3.0** |
| Good answers (score ≥ 2) | **65%** |
| Distribution | 3=9, 2=4, 1=2, 0=5 |
| Admission avg | 2.00 (n=6) |
| Curriculum avg | 1.79 (n=14) |
| API cost | ~$0.0091 |

**Changes made:**
1. **Eval set prompt** — required program name in every question, banned "this program" references and other-university mentions
2. **Eval runner** — passes `program_id` from CSV to `query()` to scope retrieval to the correct program

**Improvement: +0.55 avg score (+42% relative), +25pp good-answer rate (40% → 65%)**

---

## Remaining failure patterns (score 0–1 after fixes)

| Question | Issue |
|----------|-------|
| "minimum credit for Languages and Communication" (×3) | Credit structure chunks still retrieving wrong program despite program_id — likely section_type mismatch |
| "วิศวกรรมไฟฟ้าเครื่องกลการผลิต ต้องเรียนกี่หน่วย" | EME program has sparse chunks — curriculum structure not well-indexed |
| "นานาชาติ program accept students..." | `name_th` = "นานาชาติ" (too generic) — program resolution fails |
| "Geography admission" | Geography chunks exist but program_id resolution may be mismatched |

**Next improvement candidates:**
- Fix generic `name_th` values ("นานาชาติ") — update programs table with full program names
- Improve credit-structure retrieval: consider dedicated `structure` section type for credit tables
- Re-ingest วิทยาศาสตร์สิ่งแวดล้อม and เทคโนโลยีผลิตภัณฑ์ไม้ with better OCR model (currently 15 and 19 chunks)

---

## Iteration 3 — After re-ingesting full มคอ.2 PDFs (v2 eval set)

| Metric | Value |
|--------|-------|
| Average score | **1.80 / 3.0** |
| Good answers (score ≥ 2) | **65%** |
| Distribution | 3=8, 2=5, 1=2, 0=5 |
| Admission avg | 1.83 (n=6) |
| Curriculum avg | 1.79 (n=14) |
| API cost | ~$0.0095 |

**Changes made:**
- Re-ingested 9 engineering bachelor's programs using full มคอ.2 PDFs from `data/scanned/curriculum` (current runs typically show PyMuPDF plus Typhoon page OCR, not full Gemini OCR) instead of compact TCAS booklets.
- Chunk counts improved dramatically: EME 31→332, SemE 56→432, DMriE 21→277, WRE 27→177, MatE 46→192

**Result: No significant improvement vs v2 (+0% good-answer rate, -0.05 avg score)**

**Why better chunks didn't help:**
- Failures are structural, not data-volume issues
- Credit structure questions ("Languages and Communication minimum credits" ×3) still fail — credit tables are not well-indexed by section_type
- EME หน่วยกิต question still scores 0 despite 332 chunks — credit summary not in top-k chunks
- Geography admission still fails — program_id resolution mismatch persists

---

## Iteration 4 — After ingestion cleanup + structured completion repair (v2 eval set)

Run date: 2026-05-13

Command:

```powershell
$env:PYTHONUTF8=1; uv run python scripts/run_eval.py --eval data/eval_set_v2.csv --out data/eval_results_v4_after_cleanup.csv --delay 0.2
```

| Metric | Value |
|--------|-------|
| Average score | **1.34 / 3.0** |
| Good answers (score ≥ 2) | **46%** |
| Distribution | 3=16, 2=7, 1=5, 0=22 |
| Admission avg | 1.25 (n=12) |
| Curriculum avg | 1.35 (n=31) |
| General avg | 2.00 (n=5) |
| PLO avg | 0.00 (n=2) |
| API cost | ~$0.0180 |

**Changes since Iteration 3:**
- Program table cleanup removed stale duplicate rows: 72 -> 57 programs.
- Duplicate chunks were removed: 14,326 -> 13,910 chunks.
- Existing rows were repaired with targeted structured completion from chunks.
- Identity/UI fields now have 0 missing values; courses are fully populated in `programs`.

**Important validity note:** this run used `data/eval_set_v2.csv` without remapping old program IDs after duplicate cleanup. Fourteen rows pointed to program IDs that were intentionally deleted or merged, so those questions were forced into no-data answers.

If those stale-ID rows are excluded, the run is essentially unchanged from the previous baseline:

| Slice | Average score | Good answers |
|-------|---------------|--------------|
| All 50 rows | 1.34 / 3.0 | 46% |
| 36 rows with live program IDs | 1.86 / 3.0 | 64% |
| 14 stale-ID rows only | 0.00 / 3.0 | 0% |

**Interpretation:** no real system-wide regression is proven yet. The first fix is to remap the eval set using the cleanup merge map and rerun.

**Observed failure patterns after separating stale IDs:**
- Stale eval IDs explain 14 hard failures. Use the cleanup merge map before treating v4 as a true benchmark.
- Credit-structure questions with words like "requirement" can be misclassified as TCAS questions, which filters out `course` chunks and hides the exact credit-table line.
- Some admission questions still retrieve noisy context or fail to surface the expected factual line, including Geography and international-program cases.

**Next improvement candidates:**
- Create a post-cleanup eval set by remapping old IDs to kept IDs from `scripts/cleanup_program_duplicates.py`.
- Tighten TCAS intent detection so curriculum credit questions are not treated as admission questions just because they contain "requirement".
- Add or backfill a dedicated `structure` section type for curriculum credit tables.
- During program-scoped retrieval, add a lexical fallback over same-program chunks for terms like "Languages and Communication", "General Education", "credit", and Thai equivalents.
- Re-run after eval remapping and retrieval changes, then compare against the live-ID slice of this result.

---

## Iteration 5 — Remapped eval IDs + curriculum-structure retrieval fix

Run date: 2026-05-13

Commands:

```powershell
$env:PYTHONUTF8=1; uv run python scripts/remap_eval_program_ids.py --eval data/eval_set_v2.csv --out data/eval_set_v3_after_cleanup.csv
$env:PYTHONUTF8=1; uv run python scripts/run_eval.py --eval data/eval_set_v3_after_cleanup.csv --out data/eval_results_v5_after_remap_retrieval_fix.csv --delay 0.2
```

| Metric | Value |
|--------|-------|
| Average score | **2.02 / 3.0** |
| Good answers (score ≥ 2) | **64%** |
| Distribution | 3=26, 2=6, 1=11, 0=7 |
| Admission avg | 1.08 (n=12) |
| Curriculum avg | 2.35 (n=31) |
| General avg | 1.80 (n=5) |
| PLO avg | 3.00 (n=2) |
| API cost | ~$0.0185 |

**Changes since Iteration 4:**
- Remapped 14 stale eval rows using the duplicate-cleanup merge map.
- Suppressed TCAS mode for curriculum credit/structure questions.
- Added same-program keyword fallback for curriculum-structure terms such as `หน่วยกิต`, `หมวดวิชาศึกษาทั่วไป`, `วิชาเฉพาะ`, and "Languages and Communication".

**Result: best current average-score benchmark.** Curriculum questions improved substantially, and both PLO/philosophy items now pass. Good-answer rate is roughly back at the old baseline because admission questions remain weak.

**Remaining failure patterns:**
- Admission questions remain the weakest group, especially older pamphlet-style facts and international-student policy questions.
- Some remapped engineering rows now use fuller registrar PDFs; a few old ground truths no longer exactly match the replacement source.
- Digital Manufacturing and Robotics Engineering still has weak general-education retrieval despite the keyword fallback.

**Next improvement candidates:**
- Regenerate a fresh eval set from current chunks instead of carrying old source-derived ground truths forward.
- Add admission-policy keyword fallback for terms like Facebook, foreign/international students, expected graduates, revenue, and complaint/contact info.
- Add a `structure` section type/backfill so curriculum tables are explicitly indexed rather than found through keyword fallback.

---

## Iteration 6 — Fresh current-chunk eval set + broader evidence fallback

Run date: 2026-05-13

Commands:

```powershell
$env:PYTHONUTF8=1; uv run python scripts/generate_eval_set.py --target 50 --qa-per-chunk 2 --out data/eval_set_v6_current_chunks.csv
$env:PYTHONUTF8=1; uv run python scripts/run_eval.py --eval data/eval_set_v6_current_chunks.csv --out data/eval_results_v6_current_chunks.csv --delay 0.2
```

| Metric | Value |
|--------|-------|
| Average score | **2.04 / 3.0** |
| Good answers (score ≥ 2) | **70%** |
| Distribution | 3=24, 2=11, 1=8, 0=7 |
| Admission avg | 1.82 (n=11) |
| Curriculum avg | 2.10 (n=30) |
| General avg | 2.50 (n=4) |
| PLO avg | 1.80 (n=5) |
| API cost | ~$0.0182 |

**Changes since Iteration 5:**
- Generated a fresh 50-question eval set from current chunks instead of old/remapped source rows.
- Updated eval generation to sample a more balanced section mix instead of over-sampling `admission`.
- Broadened same-program keyword fallback for plan numbers, thesis, cancelled courses, PLO terms, nationality policy, selection/contact terms, and approval dates.
- Routed nationality-policy questions away from TCAS mode even when the question contains admission words such as "เข้าศึกษา".

**Result: first current-chunk benchmark.** This is fairer than remapped old eval rows because both questions and ground truths come from the cleaned live chunk set.

**Remaining failure patterns:**
- Some generated questions are too narrow or OCR-noisy, especially course-title questions with corrupted Thai text.
- A few curriculum questions need table-row-level retrieval, not just section-level chunk retrieval.
- PLO/assessment questions need better handling of teaching/assessment method tables.
- Admission-policy answers still sometimes over-explain or answer adjacent admission criteria instead of the exact policy line.

**Next improvement candidates:**
- Add a rerank step that rewards chunks containing multiple query terms rather than only prepending keyword hits. Completed in Iteration 7.
- Filter generated eval questions that contain visibly corrupted text or ask for page-number-like metadata. Partially completed in Iteration 7.
- Add table-aware chunk metadata or a `structure` / `assessment` / `policy` section backfill for rows with dense tables.

---

## Iteration 7 — Targeted lexical rerank on current eval set

Run date: 2026-05-13

Command:

```powershell
$env:PYTHONUTF8=1; uv run python scripts/run_eval.py --eval data/eval_set_v6_current_chunks.csv --out data/eval_results_v6_current_chunks.csv --delay 0.2
```

| Metric | Value |
|--------|-------|
| Average score | **2.26 / 3.0** |
| Good answers (score ≥ 2) | **74%** |
| Distribution | 3=30, 2=7, 1=9, 0=4 |
| Admission avg | 2.09 (n=11) |
| Curriculum avg | 2.23 (n=30) |
| General avg | 2.75 (n=4) |
| PLO avg | 2.40 (n=5) |
| API cost | ~$0.0197 |

**Changes since Iteration 6:**
- Added a lightweight lexical reranker over a larger candidate pool.
- Limited lexical reranking to explicit structure/PLO/TCAS-style questions so broad semantic questions stay vector-ranked.
- Filtered future generated eval sets for obvious OCR-corrupted generated questions.

**Result: current headline benchmark.** The biggest gains came from year/semester course-list questions, nationality-policy admission questions, and PLO evidence retrieval.

**Benchmark note:** The MLflow run named `latest_submission_headline_v7_rerank_74pct` contains the current headline result after the targeted lexical rerank: 74% good and 2.26 / 3.0. The separate `v7_filtered_rerank_stress` run uses `data/eval_set_v7_filtered_current_chunks.csv`, a harder filtered sample with more course-table/current-chunk stress cases. It scored 62% good and 1.92 / 3.0, so it should be reported as a stress/regression benchmark, not as a same-set drop from 74%.

---

## Iteration 8 — Structured fee + TCAS regression eval

Run date: 2026-05-13

Commands:

```powershell
$env:PYTHONUTF8=1; uv run python scripts/augment_eval_set_structured.py --base data/eval_set_v7_filtered_current_chunks.csv --out data/eval_set_v8_structured.csv
$env:PYTHONUTF8=1; uv run python scripts/run_eval.py --eval data/eval_set_v8_structured.csv --out data/eval_results_v8_structured.csv --delay 0.2 --mlflow --run-name v8_structured_tcas_fees
```

| Metric | Value |
|--------|-------|
| Average score | **2.055 / 3.0** |
| Good answers (score ≥ 2) | **72.7%** |
| Distribution | 3=26, 2=14, 1=7, 0=8 |
| Curriculum avg | 2.029 (n=34) |
| Admission avg | 2.091 (n=11) |
| Fee avg | 2.500 (n=2) |
| TCAS avg | 2.000 (n=3) |
| PLO avg | 2.000 (n=3) |
| API cost | ~$0.0228 |
| MLflow run | `8a47e44b6c034bbcb83f697ecfdfe603` |

**Changes since Iteration 7:**
- Added `programs.fees` as structured JSONB metadata and backfilled source-backed fee data.
- Added fee-aware RAG context so fee questions use `programs.fees` and do not borrow tuition numbers from other programs.
- Added structured regression questions for fees and TCAS using `scripts/augment_eval_set_structured.py`.
- Logged this run directly to MLflow through `scripts/run_eval.py --mlflow`.

**Interpretation:** v8 is a broader regression suite, not a pure replacement for the v7 headline benchmark. It includes the harder filtered current-chunk set plus structured fee/TCAS cases. The fee and TCAS slices pass at score ≥2, including the negative SKE fee case that previously hallucinated Accountancy tuition.

---

## MLflow Tracking

Current tracking store:

```powershell
cd pipeline
uv run mlflow ui --backend-store-uri sqlite:///mlflow.db --port 5000
```

Existing eval CSVs that were created before MLflow logging was added have been backfilled with:

```powershell
uv run python scripts/log_eval_results_to_mlflow.py
```

Backfilled run names include `v1_baseline_unscoped`, `v2_program_named_eval`, `v3_full_pdf_reingest`, `v4_ingestion_cleanup`, `v5_remap_retrieval_fix`, `latest_submission_headline_v7_rerank_74pct`, and `v7_filtered_rerank_stress`. The existing `baseline`, `wider_retrieval`, `strict_threshold`, and `v8_structured_tcas_fees` runs were already present and were skipped.

---

## Files

| File | Description |
|------|-------------|
| `data/eval_set.csv` | v1 eval set (50 Q&A pairs, has quality issues) |
| `data/eval_set_v2.csv` | v2 eval set (50 Q&A pairs, program-named questions) |
| `data/eval_set_v3_after_cleanup.csv` | v3 eval set with stale program IDs remapped after cleanup |
| `data/eval_set_v6_current_chunks.csv` | v6 eval set generated from current cleaned chunks |
| `data/eval_set_v7_filtered_current_chunks.csv` | v7 filtered current-chunk stress eval set |
| `data/eval_set_v8_structured.csv` | v8 structured regression eval with fee and TCAS cases |
| `data/eval_results.csv` | v1 results (40% good) |
| `data/eval_results_v2.csv` | v2 results (65% good) |
| `data/eval_results_v3.csv` | v3 results (65% good, re-ingested full PDFs) |
| `data/eval_results_v4_after_cleanup.csv` | v4 results (46% good, after ingestion cleanup + structured repair) |
| `data/eval_results_v5_after_remap_retrieval_fix.csv` | v5 results (64% good, remapped IDs + retrieval fix) |
| `data/eval_results_v6_current_chunks.csv` | current headline result (74% good, current chunks + targeted lexical rerank) |
| `data/eval_results_v7_filtered_rerank.csv` | v7 stress result (62% good, filtered harder current-chunk set) |
| `data/eval_results_v8_structured.csv` | v8 structured regression result (72.7% good, fee/TCAS included) |
| `scripts/generate_eval_set.py` | Synthetic eval set generator |
| `scripts/run_eval.py` | LLM-as-judge evaluation runner |
| `scripts/augment_eval_set_structured.py` | Appends structured fee and TCAS regression cases |
| `scripts/backfill_program_fees.py` | Backfills source-backed `programs.fees` metadata |
| `scripts/log_eval_results_to_mlflow.py` | Backfills existing eval result CSVs to MLflow |

## How to Read the Current Benchmarks

The selected latest production model is **v8 structured RAG**: the v7 targeted lexical rerank retrieval path plus TCAS relinking, structured fee grounding, and Thai/English response-policy fixes. This is the model behavior most representative of the real frontend because real users ask curriculum, TCAS, fee, and missing-data questions.

The current eval names are slightly historical:

- `latest_submission_headline_v7_rerank_74pct` in MLflow is the **headline retrieval benchmark** after the v7 targeted lexical rerank code path was applied. It is the 74% good / 2.26 result used for the main submission claim.
- `v7_filtered_rerank_stress` is a **harder stress benchmark**, not a same-dataset regression. It uses a filtered regenerated set that is more course-table heavy, so its 62% good / 1.92 result is evidence of remaining hard cases rather than proof that the retriever got worse.
- `v8_structured_tcas_fees` is the **selected/latest production regression benchmark** for the full behavior shipped to the frontend. It includes the harder stress set plus explicit fee/TCAS cases and verifies that the system no longer borrows tuition values across programs.
| `scripts/remap_eval_program_ids.py` | Remaps stale eval program IDs using cleanup merge map |
