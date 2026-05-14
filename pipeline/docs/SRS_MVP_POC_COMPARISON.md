# SRS vs MVP Plan vs Current POC Comparison

Date: 2026-05-14

This note compares three sources of truth:

- Old SRS context: `pipeline/docs/SRS_CONTEXT.md`
- New MVP evaluation plan: `pipeline/docs/KUru_MVP_Evaluation_Plan (1).docx`
- Current POC implementation/docs: `pipeline/docs/Part_A_report.md`, `pipeline/docs/Part_B_alignment.md`, `pipeline/docs/eval_results.md`, `pipeline/docs/current-ingestion-state.md`, and `README.md`

Use this as the working brief for revising the old SRS.

## Big Picture

The old SRS is a full product proposal. It describes KUru as a broad AI pathway navigator with a RAG chatbot, RIASEC interest discovery, hybrid recommendation, Neo4j graph, O*NET career matching, portfolio checker, comparison view, saved dashboard, timeline visualizer, and behavioral personalization.

The new MVP Evaluation Plan narrows that into a realistic MVP. It says the passing MVP is not every feature in the SRS; it is a smaller evaluated system:

| Use Case | Feature | MVP Status |
|---|---|---|
| UC-01 | RIASEC Interest Discovery | In scope |
| UC-02 | Program Recommendation Engine | In scope, simplified to Pipeline B2 only |
| UC-04 | KUru Advisor Chatbot | In scope |
| UC-08 | Recommendation Explanation | In scope |
| UC-09 | Semantic Program Search | In scope |
| UC-03 | PLO Chart | Partial, static chart only |
| UC-05 | TCAS Admission Guide | Partial, program detail page + chatbot only |
| UC-06 | Career Explorer | Cut to Phase 2 |
| UC-07 | Behavioral Blending | Cut to Phase 2 |
| UC-10 | Program Comparison View | Cut to Phase 2 |
| UC-11 | Curriculum Timeline Visualizer | Cut to Phase 2 |
| UC-12 | Portfolio Readiness Checker | Cut to Phase 2 |
| Neo4j Pipeline B1 | PLO graph-based curriculum matching | Deferred |

The current POC is strongest on the RAG, TCAS, fee grounding, MLflow, and frontend integration side. It is not yet fully aligned with the new MVP evaluation plan's recommendation metrics.

## Key Mismatches To Fix In The Old SRS

| Area | Old SRS Says | New MVP Plan Says | Current POC Reality | Revision Needed |
|---|---|---|---|---|
| Scope | Broad full product | Narrow MVP with explicit cuts | POC is mostly RAG + frontend + program explorer | Add an explicit MVP scope section and mark deferred features clearly |
| Recommender | Hybrid Pipeline A + B, O*NET + Neo4j + pgvector | Simplified Pipeline B2 only, no Neo4j Pipeline B1 | Current POC does not yet show final recommender eval | Split architecture into target system vs MVP implementation |
| Neo4j | Central to PLO-skill-career graph | Deferred from MVP | Not part of current evaluated POC | Move Neo4j to Phase 2 / future architecture |
| RAG evaluation | RAGAS in SRS | RAGAS required in MVP plan | Current POC uses custom LLM-as-judge, not RAGAS | Either add RAGAS, or revise MVP plan to allow custom judge for POC |
| Metrics | RAGAS + MRR/NDCG + SUS | Same, with exact thresholds | Current POC has 0-3 judge score, MLflow, good-answer percentage | Add bridge section explaining POC metric vs final MVP metric |
| TCAS | Full structured guide | Partial: detail page + chatbot only | Matches current POC fairly well | Update SRS to say standalone TCAS guide is Phase 2 |
| PLO chart | Overlaid with student profile | Static only in MVP | Current explorer supports PLO detail | Revise MVP acceptance to static PLO profile only |
| Portfolio checker | MVP top 10 programs in old SRS | Cut to Phase 2 in MVP plan | Frontend has UI, but not evaluated as final AI feature | Mark as prototype / Phase 2, not MVP grading target |
| Program comparison | Full pin + compare | Cut to Phase 2 | Not core current POC | Defer |
| Saved dashboard / behavior blending | Included in full product | Cut | Not current POC | Defer |
| Dataset size | Older assumptions and new plan mention 2,524 TCAS records | Current docs say 57 programs / 13,910 chunks | Current state is cleaned/reduced corpus | Distinguish target coverage from current cleaned POC corpus |
| Source inspection | Full trust UX implies users can verify answers against source material | MVP plan does not explicitly require clickable source documents | Current POC shows citation chips, but they are not clickable PDF/page/chunk viewers | Document as Phase 2 trust/transparency improvement |

## Most Important Evaluation Decision

The main unresolved alignment issue is RAGAS.

Current POC docs say:

- RAGAS was considered.
- A custom LLM-as-judge rubric was used instead.
- The reason was that KUru needs Thai/English KU-specific correctness checks, structured TCAS/fee evidence checks, and missing-data behavior checks.

The new MVP plan says:

- RAGAS Faithfulness > 0.80.
- RAGAS Answer Relevancy > 0.75.

Recommended wording for the revised SRS:

- **May 2026 POC evaluation:** custom LLM-as-judge, MLflow tracking, v8 structured RAG, 72.7% good on the fee/TCAS regression suite, 74% headline retrieval benchmark.
- **Final MVP evaluation:** add RAGAS as a standardized supplementary metric for UC-04 and UC-08, while keeping custom regression tests for TCAS, fees, aliases, bilingual behavior, and missing-data honesty.

This keeps the current POC documentation honest while preserving the MVP plan's RAGAS target.

## Recommended Revised SRS Structure

1. **Product Vision**
   Keep the full KUru vision, including RAG, RIASEC, recommendation, TCAS, and future career/portfolio features.

2. **MVP Scope Boundary**
   Add a table based on the MVP plan:
   - In scope
   - Partial scope
   - Cut / Phase 2

3. **Architecture: Target vs MVP**
   Split the architecture into:
   - Target architecture: RAG + RIASEC + Neo4j + O*NET + behavioral blending.
   - MVP architecture: RAG + Supabase pgvector + Pipeline B2 recommender + static PLO chart + TCAS detail/chat.

4. **Use Case Revision**
   For every UC-01 to UC-12, add:
   - MVP status
   - Evaluation method
   - Phase 2 condition if cut

5. **Evaluation Plan**
   Replace vague metrics with:
   - UC-01: completion rate > 80%, SUS
   - UC-02: MRR > 0.60, NDCG@5
   - UC-04: RAGAS faithfulness/relevancy plus custom TCAS/fee regression
   - UC-08: explanation faithfulness
   - UC-09: SUS + semantic query checks

6. **Current POC Status**
   Add a May 2026 POC baseline:
- 57 cleaned Bangkhen programs
- 13,910 chunks
- v8 structured RAG selected
- MLflow run `v8_structured_tcas_fees`
- Known limitation: recommendation evaluation is not yet at final MVP metric stage
- Known limitation: answer citations show source provenance but do not yet open the exact PDF page or extracted chunk

## Source Files For The SRS Revision

Use these files as the input bundle when rewriting the SRS:

| Purpose | File |
|---|---|
| New MVP scope and pass/fail plan | `pipeline/docs/KUru_MVP_Evaluation_Plan.extracted.txt` |
| Old full-product SRS | `pipeline/docs/SRS_CONTEXT.md` |
| Current AI system design | `pipeline/docs/Part_A_report.md` |
| Current B1-B7 evidence map | `pipeline/docs/Part_B_alignment.md` |
| Current RAG evaluation history | `pipeline/docs/eval_results.md` |
| Current ingestion and corpus state | `pipeline/docs/current-ingestion-state.md` |
| Current project navigation | `README.md` |

## Recommendation

Revise the old SRS by making the new MVP Evaluation Plan the source of truth for MVP scope. Do not delete the full-product ideas; demote them to Phase 2 / Target System.

The current POC should be described as the May 2026 technical baseline, mainly proving:

- RAG over curriculum documents
- TCAS and fee grounding
- ingestion cleanup and structured metadata
- frontend/backend integration
- MLflow-backed evaluation
- source-cited chat responses

It should also be honest about what is still missing from the trust UX:

- Citation chips show `source_file`, `section_type`, and similarity/confidence context.
- They are not yet clickable source viewers.
- Phase 2 should add `chunk_id`, page number, and/or source URL so users can inspect the exact evidence behind an answer.

The revised SRS should clearly separate:

1. **What KUru ultimately aims to become**
2. **What the MVP is responsible for proving**
3. **What the current POC already demonstrates**
