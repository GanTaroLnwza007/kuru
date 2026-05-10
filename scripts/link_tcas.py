"""Link orphaned tcas_records (program_id IS NULL) to the programs table.

Matches records by extracting the program keyword from program_name_raw and
comparing against programs.name_th / name_en.

Run after assign_slugs.py so programs already have slugs.
Safe to run multiple times (idempotent — skips already-linked rows).
"""

from __future__ import annotations

import os
import re
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv(dotenv_path=Path(__file__).parent.parent / "backend" / ".env")

# Canonical 20 program IDs we care about
TARGET_IDS = {
    "bangkhen_978e034a", "bangkhen_ef87a252", "bangkhen_f59cc529",
    "bangkhen_bbc3aed6", "bangkhen_45012e1a", "bangkhen_b329a2c4",
    "bangkhen_5b6f81ed", "bangkhen_a612dbb4", "bangkhen_ddf705a9",
    "bangkhen_95070360", "bangkhen_57bbf1ac", "bangkhen_282b5991",
    "bangkhen_11a20d3f", "bangkhen_0a75bd0f", "bangkhen_b3439795",
    "bangkhen_df395fd7", "bangkhen_490b53ef", "bangkhen_13e0215f",
    "bangkhen_6471b30d", "bangkhen_1ca687c1",
}


def _extract_program_name(raw: str) -> str:
    """Extract the core program name from a Thai degree string.

    Examples:
      "วศ.บ. สาขาวิชาวิศวกรรมคอมพิวเตอร์"  → "วิศวกรรมคอมพิวเตอร์"
      "น.บ."                                → ""
    """
    m = re.search(r"สาขาวิชา(.+)", raw)
    if m:
        return m.group(1).strip()
    # Fallback: strip the degree abbreviation at the start
    cleaned = re.sub(r"^[\w.]+\s*", "", raw).strip()
    return cleaned


def _best_match(
    extracted: str, programs: list[dict]
) -> tuple[str, str] | None:
    """Return (program_id, program_name_en) for the best matching program, or None."""
    if not extracted:
        return None

    scored: list[tuple[float, str, str]] = []
    for prog in programs:
        name_th: str = prog.get("name_th") or ""
        name_en: str = prog.get("name_en") or ""
        score = 0.0
        if extracted and name_th and extracted in name_th:
            score = len(extracted) / max(len(name_th), 1)
        elif extracted and name_en:
            # Try rough keyword overlap for English names
            words_en = set(name_en.lower().split())
            words_ex = set(extracted.lower().split())
            if words_en & words_ex:
                score = len(words_en & words_ex) / max(len(words_en), 1) * 0.5
        if score > 0:
            scored.append((score, prog["id"], name_en))

    if not scored:
        return None

    scored.sort(reverse=True)
    best_score, best_id, best_en = scored[0]

    # Only accept confident matches (extracted name must cover >40% of name_th)
    if best_score < 0.4:
        return None

    return best_id, best_en


def main() -> None:
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_KEY", "")
    if not url or not key:
        raise SystemExit("SUPABASE_URL and SUPABASE_KEY must be set in backend/.env")

    client: Client = create_client(url, key)

    # Fetch the 20 target programs
    target_programs = (
        client.table("programs")
        .select("id,name_th,name_en")
        .in_("id", list(TARGET_IDS))
        .execute()
        .data or []
    )
    print(f"Loaded {len(target_programs)} target programs\n")

    # Fetch all tcas_records with null program_id (paginate — max 1000 per call)
    orphans = (
        client.table("tcas_records")
        .select("id,program_name_raw,faculty")
        .is_("program_id", "null")
        .limit(1000)
        .execute()
        .data or []
    )
    print(f"Orphaned tcas_records (no program_id): {len(orphans)}\n")

    match_counts: dict[str, int] = {}
    unmatched: list[str] = []

    for rec in orphans:
        raw: str = rec.get("program_name_raw") or ""
        extracted = _extract_program_name(raw)
        result = _best_match(extracted, target_programs)

        if result:
            prog_id, prog_en = result
            client.table("tcas_records").update({"program_id": prog_id}).eq("id", rec["id"]).execute()
            match_counts[prog_en] = match_counts.get(prog_en, 0) + 1
        else:
            unmatched.append(raw[:60])

    print("=== Matched records ===")
    for prog_en, count in sorted(match_counts.items(), key=lambda x: -x[1]):
        print(f"  {prog_en:<50} → {count} records")

    print(f"\n=== Unmatched ({len(unmatched)}) ===")
    for raw in unmatched[:20]:
        print(f"  {raw!r}")
    if len(unmatched) > 20:
        print(f"  … and {len(unmatched) - 20} more")

    total_linked = sum(match_counts.values())
    print(f"\n✓ Done — linked {total_linked} / {len(orphans)} records")


if __name__ == "__main__":
    main()
