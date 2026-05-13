"""Gemini text-mode structured extraction — PLOs, courses, timeline, overview.

One cheap LLM call per document (~$0.002 at flash-lite pricing). No vision, no OCR.
Input: plain text from PyMuPDF. Output: typed StructuredProgram dataclass.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, field

from kuru.ingestion.utils import safe_print
from kuru.llm import LLM_MODEL, get_client

# Truncate input text to this many chars to stay within context limits.
_MAX_TEXT_CHARS = 60_000
_MAX_COMPLETION_TEXT_CHARS = 80_000

_EXTRACTION_PROMPT = """\
You are extracting structured data from a Thai university curriculum document (มคอ.2).
Return ONLY valid JSON — no markdown fences, no commentary, nothing else.

Extract these fields:
{{
  "overview": "<program overview paragraph in Thai, empty string if not found>",
  "plos": [
    {{"id": "PLO1", "description": "<Thai description>", "category": "<ethics|knowledge|intellectual|interpersonal|technology|other>"}}
  ],
  "courses": [
    {{"code": "<course code e.g. 01204111>", "name_th": "<Thai course name>", "credits": <integer>, "year": <integer 1-6>, "semester": <integer 1-3>}}
  ],
  "year_timeline": [
    {{"year": <integer>, "narrative": "<what students experience this year, in Thai>", "course_codes": ["<code>", ...]}}
  ],
  "curriculum_mapping": [
    {{"course_code": "<code>", "plo_primary": ["PLO1", ...], "plo_secondary": ["PLO2", ...]}}
  ]
}}

Rules:
- Return [] for missing arrays, "" for missing strings. Never return null.
- curriculum_mapping: filled bullet ● = plo_primary; open bullet ○ = plo_secondary.
- Extract ALL items — do not truncate lists.
- credits, year, semester must be integers.
- If year/semester for a course cannot be determined, use 0.

Document text (may be truncated):
{text}
"""

_COMPLETION_PROMPT = """\
You are completing structured data for a Thai university curriculum document (มคอ.2).
Return ONLY valid JSON — no markdown fences, no commentary, nothing else.

The previous extraction missed these fields: {missing_fields}

Use the targeted excerpts below to extract only reliable evidence. If a field is not present, return its empty value.

Return this exact JSON shape:
{{
  "overview": "<program overview paragraph in Thai, empty string if not found>",
  "plos": [
    {{"id": "PLO1", "description": "<Thai description>", "category": "<ethics|knowledge|intellectual|interpersonal|technology|other>"}}
  ],
  "courses": [
    {{"code": "<course code e.g. 01204111>", "name_th": "<Thai course name>", "credits": <integer>, "year": <integer 1-6>, "semester": <integer 1-3>}}
  ],
  "year_timeline": [
    {{"year": <integer>, "narrative": "<what students experience this year, in Thai>", "course_codes": ["<code>", ...]}}
  ],
  "curriculum_mapping": [
    {{"course_code": "<code>", "plo_primary": ["PLO1", ...], "plo_secondary": ["PLO2", ...]}}
  ]
}}

Rules:
- Return [] for missing arrays, "" for missing strings. Never return null.
- curriculum_mapping: filled bullet ● = plo_primary; open bullet ○ = plo_secondary.
- credits, year, semester must be integers.
- If year/semester for a course cannot be determined, use 0.

Targeted excerpts:
{text}
"""


@dataclass
class StructuredProgram:
    overview: str = ""
    plos: list[dict] = field(default_factory=list)
    courses: list[dict] = field(default_factory=list)
    year_timeline: list[dict] = field(default_factory=list)
    curriculum_mapping: list[dict] = field(default_factory=list)


def _parse_response(content: str) -> StructuredProgram:
    """Parse Gemini JSON response into StructuredProgram. Returns empty on failure."""
    try:
        # Strip markdown fences if the model added them despite instructions
        cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", content.strip(), flags=re.MULTILINE)
        data = json.loads(cleaned)
    except (json.JSONDecodeError, ValueError):
        return StructuredProgram()

    return StructuredProgram(
        overview=str(data.get("overview") or ""),
        plos=list(data.get("plos") or []),
        courses=list(data.get("courses") or []),
        year_timeline=list(data.get("year_timeline") or []),
        curriculum_mapping=list(data.get("curriculum_mapping") or []),
    )


def _missing_fields(program: StructuredProgram) -> list[str]:
    missing: list[str] = []
    if not program.overview:
        missing.append("overview")
    if not program.plos:
        missing.append("plos")
    if not program.courses:
        missing.append("courses")
    if not program.year_timeline:
        missing.append("year_timeline")
    if not program.curriculum_mapping:
        missing.append("curriculum_mapping")
    return missing


def _merge_if_missing(base: StructuredProgram, patch: StructuredProgram) -> StructuredProgram:
    """Fill only fields still missing in the base extraction."""
    return StructuredProgram(
        overview=base.overview or patch.overview,
        plos=base.plos or patch.plos,
        courses=base.courses or patch.courses,
        year_timeline=base.year_timeline or patch.year_timeline,
        curriculum_mapping=base.curriculum_mapping or patch.curriculum_mapping,
    )


def _chunk_text(chunk: object) -> str:
    if isinstance(chunk, dict):
        return str(chunk.get("content") or "")
    return str(getattr(chunk, "content", "") or "")


def _chunk_section(chunk: object) -> str:
    if isinstance(chunk, dict):
        return str(chunk.get("section_type") or "")
    return str(getattr(chunk, "section_type", "") or "")


def _targeted_text(chunks: list[object], missing: list[str]) -> str:
    """Build section-focused text for fields missed by the first pass."""
    selected: list[object] = []

    if "overview" in missing:
        selected.extend(chunks[:8])
        selected.extend(c for c in chunks if _chunk_section(c) == "general")
    if "plos" in missing or "curriculum_mapping" in missing:
        selected.extend(c for c in chunks if _chunk_section(c) == "plo")
    if "courses" in missing or "year_timeline" in missing or "curriculum_mapping" in missing:
        selected.extend(c for c in chunks if _chunk_section(c) == "course")

    # Fallback for imperfect section tagging.
    if not selected:
        selected = chunks

    seen: set[int] = set()
    parts: list[str] = []
    total = 0
    for chunk in selected:
        marker = id(chunk)
        if marker in seen:
            continue
        seen.add(marker)
        text = _chunk_text(chunk).strip()
        if not text:
            continue
        section = _chunk_section(chunk) or "unknown"
        piece = f"\n\n--- section: {section} ---\n{text}"
        if total + len(piece) > _MAX_COMPLETION_TEXT_CHARS:
            break
        parts.append(piece)
        total += len(piece)
    return "".join(parts)


def extract_structured(doc_text: str, verbose: bool = False) -> StructuredProgram:
    """Call Gemini in text mode and return structured program data.

    Args:
        doc_text: Full plain text extracted from the PDF.
        verbose: Print token/cost info if True.

    Returns:
        StructuredProgram with all fields populated or empty defaults.
    """
    text = doc_text[:_MAX_TEXT_CHARS]
    prompt = _EXTRACTION_PROMPT.format(text=text)

    try:
        client = get_client()
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
        )
        if not response.choices:
            safe_print("  [structured] Gemini returned no choices")
            return StructuredProgram()

        content = response.choices[0].message.content or ""
        result = _parse_response(content)

        if verbose:
            safe_print(
                f"  [structured] PLOs={len(result.plos)} courses={len(result.courses)} "
                f"timeline={len(result.year_timeline)} mapping={len(result.curriculum_mapping)}"
            )
        return result

    except Exception as exc:
        safe_print(f"  [structured] extraction failed ({type(exc).__name__}): {exc}")
        return StructuredProgram()


def extract_structured_complete(
    doc_text: str,
    chunks: list[object],
    verbose: bool = False,
) -> StructuredProgram:
    """Extract structured fields, then run a targeted completion pass if needed.

    The first pass sees the beginning of the document. The second pass only runs
    when fields are still empty and uses section-tagged chunks, which catches
    PLO/course/timeline/mapping sections that appear late in long OCR-heavy PDFs.
    """
    result = extract_structured(doc_text, verbose=verbose)
    return complete_structured_from_chunks(result, chunks, verbose=verbose)


def complete_structured_from_chunks(
    base: StructuredProgram,
    chunks: list[object],
    verbose: bool = False,
) -> StructuredProgram:
    """Complete missing structured fields from section-tagged chunks."""
    missing = _missing_fields(base)
    if not missing or not chunks:
        return base

    text = _targeted_text(chunks, missing)
    if not text.strip():
        return base

    prompt = _COMPLETION_PROMPT.format(missing_fields=", ".join(missing), text=text)
    try:
        client = get_client()
        response = client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
        )
        if not response.choices:
            safe_print("  [structured-complete] Gemini returned no choices")
            return base

        patch = _parse_response(response.choices[0].message.content or "")
        completed = _merge_if_missing(base, patch)
        if verbose:
            after = _missing_fields(completed)
            safe_print(
                "  [structured-complete] "
                f"missing before={missing} after={after} "
                f"PLOs={len(completed.plos)} courses={len(completed.courses)} "
                f"timeline={len(completed.year_timeline)} mapping={len(completed.curriculum_mapping)}"
            )
        return completed

    except Exception as exc:
        safe_print(f"  [structured-complete] extraction failed ({type(exc).__name__}): {exc}")
        return base
