"""Relink orphaned TCAS rows to the current programs table.

Curriculum cleanup can delete old program rows. Because tcas_records.program_id
uses "on delete set null", those TCAS rows survive but lose their join. This
script rebuilds the join from tcas_records.program_name_raw and programs.name_th.

Default mode is a dry run:

    uv run python scripts/relink_tcas_program_ids.py

Apply updates:

    uv run python scripts/relink_tcas_program_ids.py --apply
"""

from __future__ import annotations

import argparse
import os
import re
from collections import Counter

from supabase import create_client

from _env import load_project_env

load_project_env(__file__)


PAREN_RE = re.compile(r"\([^)]*\)")
SPACE_RE = re.compile(r"\s+")


def normalize_program_name(value: str) -> str:
    """Return a conservative comparable Thai program name."""
    value = value or ""
    if "สาขาวิชา" in value:
        value = value.split("สาขาวิชา", 1)[1]
    value = PAREN_RE.sub("", value)
    value = value.replace("หลักสูตรภาษาอังกฤษ", "")
    value = value.replace("นานาชาติ", "")
    value = value.replace("ภาคพิเศษ", "")
    value = value.replace("ปกติ", "")
    value = SPACE_RE.sub("", value)
    return value.strip(" -–—")


def fetch_all(client, table: str, select: str, page_size: int = 1000) -> list[dict]:
    rows: list[dict] = []
    start = 0
    while True:
        page = (
            client.table(table)
            .select(select)
            .range(start, start + page_size - 1)
            .execute()
            .data
            or []
        )
        rows.extend(page)
        if len(page) < page_size:
            break
        start += page_size
    return rows


def build_program_index(programs: list[dict]) -> dict[str, dict]:
    buckets: dict[str, list[dict]] = {}
    for program in programs:
        key = normalize_program_name(program.get("name_th") or "")
        if key:
            buckets.setdefault(key, []).append(program)

    # Keep only unambiguous names. Ambiguous names need manual review.
    return {key: rows[0] for key, rows in buckets.items() if len(rows) == 1}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="write relinked program_id values")
    args = parser.parse_args()

    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_KEY", "")
    if not url or not key:
        raise SystemExit("SUPABASE_URL and SUPABASE_KEY must be set")

    client = create_client(url, key)
    programs = fetch_all(client, "programs", "id,name_th,name_en,faculty")
    program_index = build_program_index(programs)
    orphans = (
        client.table("tcas_records")
        .select("id,program_name_raw,faculty,round,source_file")
        .is_("program_id", "null")
        .limit(1000)
        .execute()
        .data
        or []
    )

    matches: list[tuple[dict, dict]] = []
    unmatched: list[dict] = []
    for record in orphans:
        key = normalize_program_name(record.get("program_name_raw") or "")
        program = program_index.get(key)
        if program:
            matches.append((record, program))
        else:
            unmatched.append(record)

    print(f"programs={len(programs)} unambiguous_names={len(program_index)}")
    print(f"orphans={len(orphans)} matches={len(matches)} unmatched={len(unmatched)}")

    by_program = Counter(program["id"] for _, program in matches)
    for program_id, count in by_program.most_common():
        program = next(p for p in programs if p["id"] == program_id)
        print(f"{program_id}: {program.get('name_th') or program.get('name_en')} -> {count}")

    if unmatched:
        print("\nunmatched sample:")
        for record in unmatched[:25]:
            print(f"- {record.get('program_name_raw')}")

    if not args.apply:
        print("\ndry run only; pass --apply to update tcas_records.program_id")
        return

    for record, program in matches:
        client.table("tcas_records").update({"program_id": program["id"]}).eq("id", record["id"]).execute()

    print(f"\nupdated={len(matches)}")


if __name__ == "__main__":
    main()
