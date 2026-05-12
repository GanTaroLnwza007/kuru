"""Backfill missing structured program fields from existing chunks.

This uses the same targeted completion logic now used during ingestion. It does
not OCR or embed documents again; it only sends section-tagged chunks to the
structured extractor for programs with missing semantic fields.

Run from `pipeline/`:
    uv run python scripts/backfill_structured_from_chunks.py --limit 3
    uv run python scripts/backfill_structured_from_chunks.py --limit 3 --apply
"""

from __future__ import annotations

import argparse
from pathlib import Path

from dotenv import load_dotenv

from kuru.db.supabase_client import get_client
from kuru.ingestion.structured_extractor import StructuredProgram, complete_structured_from_chunks


STRUCTURED_FIELDS = ("overview", "plos", "courses", "year_timeline", "curriculum_mapping")


def _program_from_row(row: dict) -> StructuredProgram:
    return StructuredProgram(
        overview=str(row.get("overview") or ""),
        plos=list(row.get("plos") or []),
        courses=list(row.get("courses") or []),
        year_timeline=list(row.get("year_timeline") or []),
        curriculum_mapping=list(row.get("curriculum_mapping") or []),
    )


def _updates(before: StructuredProgram, after: StructuredProgram) -> dict:
    updates: dict = {}
    if not before.overview and after.overview:
        updates["overview"] = after.overview
    if not before.plos and after.plos:
        updates["plos"] = after.plos
    if not before.courses and after.courses:
        updates["courses"] = after.courses
    if not before.year_timeline and after.year_timeline:
        updates["year_timeline"] = after.year_timeline
    if not before.curriculum_mapping and after.curriculum_mapping:
        updates["curriculum_mapping"] = after.curriculum_mapping
    return updates


def _coverage(row: dict, after: StructuredProgram) -> dict:
    cov = dict(row.get("coverage") or {})
    cov.update({
        "has_overview": bool(after.overview),
        "has_plos": bool(after.plos),
        "plo_count": len(after.plos),
        "has_courses": bool(after.courses),
        "course_count": len(after.courses),
        "has_timeline": bool(after.year_timeline),
        "has_curriculum_mapping": bool(after.curriculum_mapping),
    })
    return cov


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Apply updates; otherwise dry-run only.")
    parser.add_argument("--limit", type=int, default=5, help="Maximum number of programs to process.")
    parser.add_argument("--program-id", help="Only process one program ID.")
    args = parser.parse_args()

    load_dotenv(Path("../backend/.env"))
    load_dotenv(Path("backend/.env"))
    client = get_client()

    query = client.table("programs").select("*")
    if args.program_id:
        query = query.eq("id", args.program_id)
    programs = query.limit(1000).execute().data or []

    targets = []
    for row in programs:
        if any(row.get(field) in (None, "", [], {}) for field in STRUCTURED_FIELDS):
            targets.append(row)
    targets = targets[: args.limit]

    print("Programs to process:", len(targets))
    for row in targets:
        chunks = (
            client.table("chunks")
            .select("content,section_type")
            .eq("program_id", row["id"])
            .limit(1000)
            .execute()
            .data
            or []
        )
        before = _program_from_row(row)
        after = complete_structured_from_chunks(before, chunks, verbose=True)
        updates = _updates(before, after)
        if updates:
            updates["coverage"] = _coverage(row, after)
        print(
            row["id"],
            row.get("name_th") or row.get("name_en") or "",
            "chunks=",
            len(chunks),
            "updates=",
            list(updates.keys()),
        )
        if args.apply and updates:
            client.table("programs").update(updates).eq("id", row["id"]).execute()


if __name__ == "__main__":
    main()
