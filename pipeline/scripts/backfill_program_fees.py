"""Backfill source-backed tuition/fee metadata onto programs.fees.

The extractor is intentionally conservative. It stores fee data only when a
same-program chunk explicitly describes tuition/fees per program, usually with
"ตลอดหลักสูตร" or per-semester wording. Budget revenue tables are ignored unless
they contain an explicit per-student/program fee phrase.

Usage:
    uv run python scripts/backfill_program_fees.py
    uv run python scripts/backfill_program_fees.py --migrate --apply
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from typing import Any

import psycopg2
from supabase import create_client

from _env import load_project_env

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

load_project_env(__file__)

FEE_TERMS = [
    "ค่าเทอม",
    "ค่าธรรมเนียมการศึกษา",
    "ค่าธรรมเนียมการศึกษาเหมาจ่าย",
    "ธรรมเนียมการศึกษา",
    "ค่าเล่าเรียน",
    "ตลอดหลักสูตร",
    "ต่อภาคการศึกษา",
    "tuition",
    "fee",
]

MONEY_RE = re.compile(r"(?<!\d)(\d{1,3}(?:,\d{3})+|\d{5,})(?!\d)")
TOTAL_RE = re.compile(
    r"(?:ค่าธรรมเนียมการศึกษา|ค่าเล่าเรียน|tuition|fee)[^.。\n]{0,120}?"
    r"(\d{1,3}(?:,\d{3})+|\d{5,})\s*บาท[^.。\n]{0,80}?(?:ตลอดหลักสูตร|ทั้งหลักสูตร)",
    re.IGNORECASE,
)
PER_SEM_RE = re.compile(
    r"(\d{1,3}(?:,\d{3})+|\d{5,})\s*บาท[^.。\n]{0,50}?(?:ต่อภาคการศึกษา|ภาคการศึกษาละ)",
    re.IGNORECASE,
)


def _money(value: str) -> int:
    return int(value.replace(",", ""))


def _compact(text: str, limit: int = 900) -> str:
    text = re.sub(r"\s+", " ", _normalize_ocr_text(text or "")).strip()
    return text[:limit]


def _normalize_ocr_text(text: str) -> str:
    return (
        (text or "")
        .replace("คา", "ค่า")
        .replace("ค า", "ค่า")
        .replace("", "่")
        .replace("", "้")
    )


def _is_fee_evidence(text: str) -> bool:
    text = _normalize_ocr_text(text)
    lowered = text.lower()
    if not any(term.lower() in lowered for term in FEE_TERMS):
        return False
    return bool(
        "ตลอดหลักสูตร" in text
        or "ทั้งหลักสูตร" in text
        or "ต่อภาคการศึกษา" in text
        or "per semester" in lowered
        or "tuition fee" in lowered
    )


def extract_fee(row: dict[str, Any]) -> dict[str, Any] | None:
    content = _normalize_ocr_text(row.get("content") or "")
    if not _is_fee_evidence(content):
        return None

    total_match = TOTAL_RE.search(content)
    per_semester = [_money(m.group(1)) for m in PER_SEM_RE.finditer(content)]
    all_amounts = [_money(m.group(1)) for m in MONEY_RE.finditer(content)]

    if not total_match and not per_semester:
        return None

    fee: dict[str, Any] = {
        "status": "found",
        "currency": "THB",
        "source_file": row.get("source_file"),
        "source_chunk_id": row.get("id"),
        "evidence": _compact(content),
    }
    if total_match:
        fee["total_program_baht"] = _money(total_match.group(1))
    if per_semester:
        fee["per_semester_baht"] = sorted(set(per_semester))
    if all_amounts:
        fee["amounts_baht"] = sorted(set(all_amounts))
    return fee


def migrate_schema() -> None:
    db_url = os.environ.get("DATABASE_URL", "").replace("\n", "").strip()
    if not db_url:
        raise SystemExit("DATABASE_URL is required for --migrate")
    with psycopg2.connect(db_url) as conn:
        with conn.cursor() as cur:
            cur.execute("alter table programs add column if not exists fees jsonb default '{}';")
        conn.commit()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--migrate", action="store_true", help="add programs.fees if missing")
    parser.add_argument("--apply", action="store_true", help="write fees to programs")
    args = parser.parse_args()

    if args.migrate:
        migrate_schema()
        print("schema: ensured programs.fees")

    client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])
    programs = client.table("programs").select("id,name_th,name_en,fees").limit(1000).execute().data or []

    found = 0
    for program in programs:
        query = client.table("chunks").select("id,program_id,source_file,section_type,content").eq("program_id", program["id"])
        term_filters = ",".join(f"content.ilike.%{term}%" for term in FEE_TERMS)
        rows = query.or_(term_filters).limit(50).execute().data or []

        fee = None
        for row in rows:
            fee = extract_fee(row)
            if fee:
                break

        if not fee:
            continue

        found += 1
        print(f"{program['id']}: {program.get('name_th') or program.get('name_en')} -> {fee.get('total_program_baht') or fee.get('per_semester_baht')}")
        if args.apply:
            client.table("programs").update({"fees": fee}).eq("id", program["id"]).execute()

    print(f"\nfees_found={found} apply={args.apply}")


if __name__ == "__main__":
    main()
