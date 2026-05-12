# Current Ingestion State

_Last updated: 2026-05-13_

This note describes the live ingestion behavior after the May 2026 registrar scrape and targeted re-ingest work. Older design notes may still describe a pure "native PDF" pipeline or OpenRouter-based OCR; treat this file and the current source code as the operational reference.

## Source Folders

- Registrar curriculum PDFs are downloaded from `https://registrar.ku.ac.th/cur/all`.
- The scraper writes them to `data/native/curriculum/<campus>/<faculty>/` for compatibility with existing ingest commands.
- The name `native` is historical. Files in that tree are not guaranteed to be born-digital PDFs; many registrar PDFs are scans or mixed PDFs with image-only pages.
- TCAS files still live under `data/native/tcas/`.

Current registrar scrape result for Bangkhen was approximately 270 public PDF links, with one skipped/dead link during the latest full download.

## Extraction And API Usage

The curriculum ingest path is:

1. Run PyMuPDF on every PDF page.
2. For low-yield pages, call Typhoon page OCR when `TYPHOON_API_KEY` is set.
3. If the whole PDF has less than the scanned threshold after page extraction, mark all pages as scanned and call `ocr_extractor.extract_with_ocr()`.
4. Chunk the resulting text, embed locally with multilingual-e5, and upsert chunks to Supabase.
5. Run structured extraction through Gemini text mode for program metadata, courses, PLOs, and coverage.
6. If structured fields are still missing, run a targeted completion pass over the already-created section-tagged chunks (`plo`, `course`, `general`) before writing the `programs` row.

API keys by path:

| Path | Default model | Key used |
|------|---------------|----------|
| Structured extraction | `LLM_MODEL=gemini-2.5-flash-lite` | `GEMINI_API_KEY` |
| Full scanned-PDF OCR | `OCR_MODEL=gemini-2.5-flash` | `GEMINI_API_KEY` |
| Full scanned-PDF OCR via OpenRouter | `OCR_MODEL=google/gemini-2.5-flash` or any `provider/model` value | `OPENROUTER_API_KEY` |
| Page OCR for low-yield pages | `typhoon-ocr` | `TYPHOON_API_KEY` |
| RAG answer generation | `GENERATION_MODEL=google/gemini-2.5-flash-lite` | `OPENROUTER_API_KEY` |
| Embeddings | local multilingual-e5 | no API key |

Important cost-tracking implication: a low Gemini request count does not mean no OCR happened. The recent targeted re-ingests mostly recorded `coverage.extraction_method = "pymupdf+typhoon_pages"`, so OCR spend would appear on Typhoon, while Gemini only saw the smaller structured-extraction calls.

If the Gemini dashboard shows only a handful of calls, do not automatically attribute them to scanned-PDF ingestion. They may be from partner experiments, direct Gemini smoke tests, structured extraction on a small number of ingested files, or any script that imports `kuru.llm.get_client()`. The pipeline CLI and backend chat RAG path use OpenRouter for answer generation through `GENERATION_MODEL`; they do not use the direct Gemini key for normal chat responses.

## Recent Targeted Re-Ingest

The May 10 audit found several bad or suspicious chunk sets. Targeted replacement/re-ingest was run against registrar PDFs using the default environment. Completed replacements currently show `pymupdf+typhoon_pages`, not full `gemini_ocr`.

Completed examples from the latest DB check:

| Program ID | Chunks | Program | Extraction method |
|------------|--------|---------|-------------------|
| `bangkhen_agri_bc9eb883` | 238 | Home Economics | `pymupdf+typhoon_pages` |
| `bangkhen_agri_a1c5cd07` | 152 | Soil Science | `pymupdf+typhoon_pages` |
| `bangkhen_agri_54c51c81` | 165 | Entomology | `pymupdf+typhoon_pages` |
| `bangkhen_eng_dba25831` | 91 | Civil Engineering - Water Resources | `pymupdf+typhoon_pages` |
| `bangkhen_vettech_07588f76` | 511 | Veterinary Nursing | `pymupdf+typhoon_pages` |
| `bangkhen_eng_63fa1a4f` | 97 | Mechanical Engineering | `pymupdf+typhoon_pages` |
| `bangkhen_eng_55775940` | 221 | Survey and Geographic Information Engineering | `pymupdf+typhoon_pages` |
| `bangkhen_soc_b5ea546e` | 646 | Law | `pymupdf+typhoon_pages` |
| `bangkhen_soc_073a63c5` | 16 | Political Science | `pymupdf+typhoon_pages` |

Outstanding:

- `bangkhen_vet_9ea52f52` (`สพ.บ._2568.pdf`) is an 870-page DVM PDF. A retry was interrupted after clearing old chunks, so it currently has 0 chunks and needs a dedicated long run or a separate OCR policy.
- Some old suspect program IDs were cleared because the registrar scrape produced replacement IDs, or because the old source is no longer represented by a current registrar PDF.

## Program Table Hygiene

After the registrar re-ingest, the `programs` table contained stale Google Drive/compact-PDF rows alongside newer registrar rows. This happened because program IDs are derived from the source path and filename stem, so the same curriculum can receive a different ID when the source file changes. Chunks can duplicate in the same way because resume detection is based on `source_file`.

Cleanup scripts:

- `scripts/cleanup_program_duplicates.py` merges known stale program IDs into the kept registrar IDs, moves TCAS rows, deletes duplicate chunks, and corrects bad inferred names.
- `scripts/backfill_program_names_from_chunks.py` infers missing `name_en` values from existing chunks and applies manual overrides where the chunks do not contain a clean English program label.
- `scripts/backfill_program_metadata.py` fills safe derived metadata: `slug`, `year_by_year_vibe`, and missing `coverage`.
- `scripts/backfill_structured_from_chunks.py` is an optional repair tool that uses the same targeted structured-completion logic now built into ingestion. Use it for rows ingested before that completion pass existed.

Latest cleanup results:

- Programs: 72 -> 57 after removing stale duplicate rows.
- Chunks: 14,326 -> 13,910 after deleting duplicate old chunks.
- `name_en`, `name_th`, `slug`, `faculty`, `degree_level`, `coverage`, and `year_by_year_vibe`: 0 missing values.
- Exact duplicate `name_en` and exact duplicate `name_th`: 0.
- The bad row `name_th=นานาชาติ`, `name_en=Software and Knowledge Engineering (International Program)` was corrected to Accountancy because its chunks are from `Bachelor of Accountancy Program (International Program)`.

Remaining sparse columns are semantic structured fields, not identity fields:

| Column | Current gap | How to fix safely |
|--------|-------------|-------------------|
| `overview` | 36 / 57 missing | Re-run structured extraction or targeted re-ingest |
| `plos` | 44 / 57 missing | Re-run structured extraction; some source PDFs genuinely lack PLOs |
| `courses` | 23 / 57 missing | Re-run structured extraction; do not infer from arbitrary chunks without validation |
| `year_timeline` | 32 / 57 missing | Re-run structured extraction |
| `curriculum_mapping` | 46 / 57 missing | Re-run structured extraction; often absent in source |

Do not fill these semantic fields with generic placeholders; the RAG system should distinguish missing source evidence from inferred UI metadata.

Going forward, normal ingestion should reduce these gaps because `kuru-ingest-mko` now performs the targeted completion pass during the ingest itself. Remaining gaps after a fresh ingest usually mean the source text did not contain the section, OCR quality was too poor, or the section was too ambiguous for reliable JSON extraction.

## Operational Guidance

- Do not assume `data/native/curriculum` means "no OCR cost".
- To use direct Gemini full-document OCR, leave `OCR_MODEL=gemini-2.5-flash` or set it explicitly.
- To route full-document OCR through OpenRouter, use a provider-prefixed value such as `OCR_MODEL=google/gemini-2.5-flash`.
- Check Typhoon usage when `coverage.extraction_method` contains `typhoon_pages`.
- For very large scans such as DVM, run a small targeted script or overnight job rather than mixing it into the main batch.
- After any source swap or large re-ingest, re-run the cleanup/backfill scripts above and audit duplicate program names before evaluation.
