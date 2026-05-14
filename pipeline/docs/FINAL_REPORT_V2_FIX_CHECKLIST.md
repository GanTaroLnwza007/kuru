# Final Report v2 Fix Checklist

Source reviewed: `pipeline/docs/01219462_KUru_FinalReport_v2.txt`

Use this checklist before exporting the final report PDF.

## 1. Front Matter

Fix:

- Branch typo: `feat/pipeline/rag-AI-Enaled` -> `feat/pipeline/rag-AI-Enabled`
- Role assignment conflict. The report says README reverses the roles. Decide one official version and make all docs match.
- Project title consistency. Recommended title:
  - `KUru: Intelligent PLO-to-Career Navigator`

Suggested framing:

> Project title: KUru: Intelligent PLO-to-Career Navigator.  
> POC scope: KU curriculum/PLO/TCAS RAG advisor with cited answers and frontend integration.

## 2. A2.2.3 — AI/ML Canvas

Fix the known limitations row.

Add:

- Citation chips show provenance but are not clickable to the exact PDF/page/chunk.
- This is a UX/source-inspection limitation, not a grounding failure.
- Phase 2 improvement: add `chunk_id`, page number, and source URL.

Clarify evaluation sets:

| Benchmark | Size | Result |
|---|---:|---|
| Headline retrieval eval | 50 questions | 74% good, 2.26 / 3.0 |
| v8 structured regression | 55 questions | 72.7% good, 2.055 / 3.0 |

## 3. A2.3.1 — User Interaction Experience

Fix citation wording.

Current wording overstates verification because users cannot click through to the source.

Use:

> Source citation badges show provenance by displaying source filename and section type. In the POC they are not clickable source viewers; exact PDF/page/chunk inspection is planned for Phase 2.

Also update the "not shown to users" sentence.

Safer wording:

> Raw chunk text, program_id, and embedding vectors are not shown. Similarity is summarized through confidence/source relevance rather than exposed as a technical retrieval trace.

## 4. A2.4 — Feedback Collection and Monitoring

This section is mostly good.

Add one sentence:

> For the POC, feedback collection is implemented as a single-click thumbs up/down interaction and persisted through `POST /api/v1/chat/feedback`; automated retraining is out of scope, but ratings are used to identify future eval/regression cases.

No extra implementation is required for the POC.

## 5. Part B Intro

Fix branch typo again:

`feat/pipeline/rag-AI-Enaled` -> `feat/pipeline/rag-AI-Enabled`

Clarify model naming:

> v7 is the headline retrieval benchmark; v8 is the selected production regression suite because it includes TCAS and fee behavior.

## 6. B4 — MLflow

Make sure the report distinguishes these runs:

| Run | Meaning | Result |
|---|---|---|
| `latest_submission_headline_v7_rerank_74pct` | Headline retrieval benchmark | 74% good, 2.26 / 3.0 |
| `v8_structured_tcas_fees` | Selected production regression suite | 72.7% good, 2.055 / 3.0 |
| `v7_filtered_rerank_stress` | Harder stress set, not a same-set regression | 62% good, 1.92 / 3.0 |

If the report implies the v7 stress result is the latest model score or a regression, fix it.

## 7. B5 — Explainability

Add the citation limitation here too.

Suggested wording:

> KUru's explainability comes from retrieved source chunks, confidence level, section type, and source metadata. The current UI renders these as citation chips. The chips are not yet clickable to the original PDF page or extracted chunk, so clickable source inspection is listed as a Phase 2 trust/transparency improvement.

## 8. B6 — Prediction Reasoning

Fix confidence thresholds.

The report currently uses:

```text
HIGH top similarity >= 0.65
```

Backend code uses:

```text
similarity >= 0.50 -> high
similarity >= 0.35 -> medium
else -> low
```

Update all B6 case explanations from `0.65` to `0.50`.

## 9. B7 — Model Deployment

After the `ChatSourceChunk` schema, add the source-inspection boundary:

> Current POC source objects include `source_file`, `section_type`, and `similarity`. They do not yet include `chunk_id`, page number, or `source_url`, so frontend citations are not clickable deep links.

Endpoint paths are correct:

- `GET /api/v1/health`
- `POST /api/v1/chat`
- `POST /api/v1/chat/feedback`
- `GET /api/v1/programs/search`
- `GET /api/v1/programs/{identifier}`

## 10. C1 — UI Design

This is the weakest section.

Current report says no dedicated C1 UI design doc/mockup files exist. That is honest, but it reads weak.

Improve by adding:

- Actual frontend screenshots if available.
- Chat UI showing answer, citation chips, confidence, and feedback buttons.
- Program Explorer showing TCAS rounds.
- RIASEC screen.
- Citation click-through limitation.

Replace:

> Source citation badges ... allowing verification.

With:

> Source citation badges provide provenance; exact source click-through is a Phase 2 improvement.

## 11. C3 — Interface Testing

This needs fixing.

Current report says:

> Scenario 3 was not executed live.

Best fix: run Scenario 3 and update the actual result to PASS.

Prompt:

```text
What are the admission requirements for the Quantum Robotics Engineering program?
```

Expected:

- HTTP 200
- `confidence_level = low`
- `used_tcas_data = false`
- honest no-data answer
- no fabricated scores, course names, or admission details

If you cannot run it before submission, keep it honestly marked as expected behavior only.

## 12. AI Usage Disclosure

This section is acceptable.

Check that it matches README wording and does not imply AI made architectural decisions.

## Highest Priority Fixes

1. Fix branch typo.
2. Make role assignment consistent across report and README.
3. Add citation click-through limitation in A2.3, B5, B7, C1/C3.
4. Fix B6 confidence threshold from `0.65` to backend actual `0.50`.
5. Run or honestly mark C3 Scenario 3.
6. Clarify v7 vs v8 model story.
7. Clarify 50-question headline eval vs 55-question v8 regression.
