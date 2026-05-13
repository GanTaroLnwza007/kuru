"""Infer missing program English names from existing chunks.

Run from `pipeline/`:
    uv run python scripts/backfill_program_names_from_chunks.py
    uv run python scripts/backfill_program_names_from_chunks.py --apply
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path

from dotenv import load_dotenv

from kuru.db.supabase_client import get_client


NAME_PATTERNS = [
    re.compile(
        r"(?:Bachelor|Master|Doctor)\s+of\s+[A-Za-z][A-Za-z\s,&()/.-]{2,120}?"
        r"Program(?:me)?(?:\s+in\s+[A-Za-z][A-Za-z\s,&()/.-]{2,120})?"
        r"(?:\s*\([^)]{3,60}\))?",
        re.IGNORECASE,
    ),
    re.compile(
        r"(?:Bachelor|Master|Doctor)\s+of\s+[A-Za-z][A-Za-z\s,&()/.-]{5,140}"
        r"(?:\s*\([^)]{3,60}\))?",
        re.IGNORECASE,
    ),
]

MANUAL_OVERRIDES = {
    # Chunk text contains course forms but not a clean section-1 English program label.
    "bangkhen_hum_0371b9ef": "Bachelor of Arts Program in Western Languages",
    "bangkhen_hum_c6bef509": "Bachelor of Arts Program in English",
    # The DVM row currently has structured extraction but no chunks after an interrupted retry.
    "bangkhen_vet_9ea52f52": "Doctor of Veterinary Medicine Program",
}


def clean_name(raw: str) -> str:
    name = " ".join(raw.replace("\n", " ").split())
    for marker in (" ชื่อย", " 1.", " 2.", " ปรัชญา", " จำนวน", " สถานภาพ"):
        if marker in name:
            name = name.split(marker, 1)[0].strip()
    return name.strip(" :;-")


def infer_name(text: str) -> str | None:
    candidates: list[str] = []
    for pattern in NAME_PATTERNS:
        for match in pattern.finditer(text):
            candidate = clean_name(match.group(0))
            if len(candidate) < 18:
                continue
            if any(skip in candidate.lower() for skip in ("university, japan", "universiti", "public health")):
                continue
            if candidate not in candidates:
                candidates.append(candidate)
    return candidates[0] if candidates else None


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Apply updates; otherwise dry-run only.")
    args = parser.parse_args()

    load_dotenv(Path("../backend/.env"))
    load_dotenv(Path("backend/.env"))
    client = get_client()

    missing = (
        client.table("programs")
        .select("id,name_th,name_en")
        .is_("name_en", "null")
        .limit(1000)
        .execute()
        .data
        or []
    )

    print("Missing name_en:", len(missing))
    for program in sorted(missing, key=lambda row: row["id"]):
        program_id = program["id"]
        inferred = MANUAL_OVERRIDES.get(program_id)
        chunks: list[dict] = []
        if not inferred:
            start = 0
            while True:
                page = (
                    client.table("chunks")
                    .select("content")
                    .eq("program_id", program_id)
                    .range(start, start + 999)
                    .execute()
                    .data
                    or []
                )
                chunks.extend(page)
                if len(page) < 1000:
                    break
                start += 1000
            inferred = infer_name("\n".join(chunk.get("content") or "" for chunk in chunks))

        print(f"{program_id}: {program.get('name_th') or ''} -> {inferred or 'NO CANDIDATE'}")
        if args.apply and inferred:
            client.table("programs").update({"name_en": inferred}).eq("id", program_id).execute()


if __name__ == "__main__":
    main()
