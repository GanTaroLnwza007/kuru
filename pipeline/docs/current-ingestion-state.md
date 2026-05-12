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

## Operational Guidance

- Do not assume `data/native/curriculum` means "no OCR cost".
- To use direct Gemini full-document OCR, leave `OCR_MODEL=gemini-2.5-flash` or set it explicitly.
- To route full-document OCR through OpenRouter, use a provider-prefixed value such as `OCR_MODEL=google/gemini-2.5-flash`.
- Check Typhoon usage when `coverage.extraction_method` contains `typhoon_pages`.
- For very large scans such as DVM, run a small targeted script or overnight job rather than mixing it into the main batch.
