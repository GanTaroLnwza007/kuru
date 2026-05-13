"""Append structured TCAS and fee questions to an existing eval set.

Usage:
    uv run python scripts/augment_eval_set_structured.py \
      --base data/eval_set_v7_filtered_current_chunks.csv \
      --out data/eval_set_v8_structured.csv
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path

from supabase import create_client

from _env import load_project_env

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

load_project_env(__file__)

FIELDNAMES = [
    "question",
    "ground_truth_answer",
    "question_type",
    "source_file",
    "program_id",
    "section_type",
]


def _fmt_money(value: int | float | None) -> str:
    if value is None:
        return ""
    return f"{int(value):,}"


def _fee_rows(client) -> list[dict]:
    rows: list[dict] = []
    programs = (
        client.table("programs")
        .select("id,name_th,name_en,fees")
        .neq("fees", "{}")
        .limit(100)
        .execute()
        .data
        or []
    )
    for p in programs:
        fees = p.get("fees") or {}
        if fees.get("status") != "found":
            continue
        name = p.get("name_th") or p.get("name_en") or p["id"]
        total = fees.get("total_program_baht")
        per_semester = fees.get("per_semester_baht") or []
        parts = []
        if total:
            parts.append(f"ค่าธรรมเนียมตลอดหลักสูตรคือ {_fmt_money(total)} บาท")
        if per_semester:
            parts.append("ค่าธรรมเนียมรายภาคการศึกษาที่พบคือ " + ", ".join(_fmt_money(v) for v in per_semester) + " บาท")
        rows.append({
            "question": f"ค่าเทอมของ{name}เท่าไหร่?",
            "ground_truth_answer": " และ ".join(parts) + f" อ้างอิงจาก {fees.get('source_file')}.",
            "question_type": "fee",
            "source_file": fees.get("source_file", ""),
            "program_id": p["id"],
            "section_type": "fees",
        })

    # Negative regression: SKE must not borrow Accountancy international fees.
    ske = (
        client.table("programs")
        .select("id,name_th")
        .eq("id", "bangkhen_0a75bd0f")
        .limit(1)
        .execute()
        .data
        or []
    )
    if ske:
        rows.append({
            "question": "ค่าเทอมของวิศวกรรมซอฟต์แวร์เท่าไหร่?",
            "ground_truth_answer": "ยังไม่มีข้อมูลค่าเทอมที่มีหลักฐานอ้างอิงใน programs.fees สำหรับวิศวกรรมซอฟต์แวร์และความรู้ จึงไม่ควรตอบตัวเลขค่าเทอมจากหลักสูตรอื่น.",
            "question_type": "fee",
            "source_file": "",
            "program_id": "bangkhen_0a75bd0f",
            "section_type": "fees",
        })
    return rows


def _tcas_rows(client) -> list[dict]:
    rows: list[dict] = []
    wanted = ["bangkhen_0a75bd0f", "bangkhen_ddf705a9", "bangkhen_5a8d741f"]
    programs = {
        p["id"]: p
        for p in (
            client.table("programs")
            .select("id,name_th,name_en")
            .in_("id", wanted)
            .execute()
            .data
            or []
        )
    }
    records = (
        client.table("tcas_records")
        .select("*")
        .in_("program_id", wanted)
        .limit(50)
        .execute()
        .data
        or []
    )
    by_program: dict[str, dict] = {}
    for record in records:
        by_program.setdefault(record.get("program_id"), record)

    for pid, record in by_program.items():
        program = programs.get(pid, {})
        name = program.get("name_th") or program.get("name_en") or record.get("program_name_raw") or pid
        answer_parts = [f"{name} มีข้อมูล TCAS {record.get('round')}"]
        if record.get("quota") is not None:
            answer_parts.append(f"จำนวนรับ {record['quota']} คน")
        if record.get("gpax_min") is not None:
            answer_parts.append(f"GPAX ขั้นต่ำ {record['gpax_min']}")
        exam = record.get("exam_criteria")
        if exam:
            answer_parts.append("เกณฑ์สอบ/คะแนนคือ " + json.dumps(exam, ensure_ascii=False))
        rows.append({
            "question": f"{name} TCAS ต้องใช้อะไรบ้าง?",
            "ground_truth_answer": " ".join(answer_parts) + f" อ้างอิงจาก {record.get('source_file')}.",
            "question_type": "tcas",
            "source_file": record.get("source_file", ""),
            "program_id": pid,
            "section_type": "tcas",
        })
    return rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default="data/eval_set_v7_filtered_current_chunks.csv")
    parser.add_argument("--out", default="data/eval_set_v8_structured.csv")
    args = parser.parse_args()

    base_path = Path(args.base)
    out_path = Path(args.out)
    with base_path.open(encoding="utf-8") as f:
        base_rows = list(csv.DictReader(f))

    import os

    client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])
    extra_rows = _fee_rows(client) + _tcas_rows(client)

    seen = {(r.get("question"), r.get("program_id")) for r in base_rows}
    merged = base_rows[:]
    for row in extra_rows:
        key = (row.get("question"), row.get("program_id"))
        if key not in seen:
            merged.append(row)
            seen.add(key)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(merged)

    print(f"base={len(base_rows)} extra={len(extra_rows)} wrote={len(merged)} -> {out_path}")


if __name__ == "__main__":
    main()
