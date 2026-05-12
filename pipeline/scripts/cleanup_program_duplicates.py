"""Clean known duplicate/stale program rows after the registrar re-ingest.

This script is intentionally explicit. It only touches program IDs listed below:
- migrates TCAS records from old compact/Drive-era rows to registrar rows,
- deletes old chunks and stale program rows,
- fixes known bad inferred names.

Run from `pipeline/`:
    uv run python scripts/cleanup_program_duplicates.py --apply
"""

from __future__ import annotations

import argparse
from pathlib import Path

from dotenv import load_dotenv

from kuru.db.supabase_client import get_client


MERGES: dict[str, str] = {
    # Old compact engineering PDFs -> full registrar curricula.
    "bangkhen_a612dbb4": "bangkhen_eng_cfa0405e",  # Chemical Engineering
    "bangkhen_978e034a": "bangkhen_eng_dba25831",  # Civil-Water Resources Engineering
    "bangkhen_57bbf1ac": "bangkhen_5a8d741f",      # Electrical Engineering
    "bangkhen_524aa3dd": "bangkhen_eng_74fe6da5",  # EME
    "bangkhen_d56eb1e6": "bangkhen_eng_7c9001b4",  # DMRiE
    "bangkhen_490b53ef": "bangkhen_eng_ba8ac41d",  # Semiconductor Engineering
    # Same Science of the Land program; keep the fuller DOCX-derived record.
    "bangkhen_62a85ee2": "bangkhen_ef87a252",
    "bangkhen_7f3b69b8": "bangkhen_ef87a252",
}

DELETE_PROGRAM_IDS: set[str] = {
    # Zero-chunk stale rows left from earlier failed/cleared ingest attempts.
    "bangkhen_362ef3ec",
    "bangkhen_3976b66b",
    "bangkhen_45012e1a",
    "bangkhen_6471b30d",
    "bangkhen_91a878d9",
    "bangkhen_9312de2c",
    "bangkhen_f59cc529",
}

PROGRAM_UPDATES: dict[str, dict[str, str]] = {
    # This row was incorrectly mapped to SKE; its chunks are the Accountancy international curriculum.
    "bangkhen_1ca687c1": {
        "name_th": "บัญชีบัณฑิต",
        "name_en": "Bachelor of Accountancy Program (International Program)",
    },
    "bangkhen_ef87a252": {
        "name_th": "ศาสตร์แห่งแผ่นดินเพื่อการพัฒนาที่ยั่งยืน",
        "name_en": "Bachelor of Science Program in Knowledge of The Land for Sustainable Development",
    },
    "bangkhen_dd9a49d8": {
        "name_th": "ศึกษาศาสตร์",
        "name_en": "Bachelor of Education Program in Educational Studies",
    },
    "bangkhen_f765bc67": {
        "name_th": "วิศวกรรมโยธา-ชลประทาน",
        "name_en": "Bachelor of Engineering Program in Civil-Irrigation Engineering",
    },
    "bangkhen_13e0215f": {
        "name_th": "พยาบาลศาสตร์",
        "name_en": "Bachelor of Nursing Science Program",
    },
    "bangkhen_eng_63fa1a4f": {
        "name_th": "วิศวกรรมเครื่องกล (นานาชาติ)",
        "name_en": "Bachelor of Engineering Program in Mechanical Engineering (International Program)",
    },
    "bangkhen_b3439795": {
        "name_th": "วิศวกรรมเครื่องกล (ปกติ)",
        "name_en": "Mechanical Engineering",
    },
    "bangkhen_5a8d741f": {
        "name_th": "วิศวกรรมไฟฟ้า",
        "name_en": "Bachelor of Engineering Program in Electrical Engineering",
    },
    "bangkhen_eng_7c9001b4": {
        "name_th": "วิศวกรรมการผลิตดิจิทัลและการบูรณาการหุ่นยนต์",
        "name_en": "Digital Manufacturing and Robotics Engineering (International Program)",
    },
    "bangkhen_7600c7cd": {
        "name_th": "วิศวกรรมเคมี (ปริญญาเอก)",
        "name_en": "Doctor of Philosophy Program in Chemical Engineering",
    },
    "bangkhen_eng_b17edf6c": {
        "name_th": "วิศวกรรมวัสดุ (ปริญญาเอก)",
        "name_en": "Doctor of Philosophy Program in Materials Engineering",
    },
    "bangkhen_fish_21970d53": {
        "name_th": "วิทยาศาสตร์การประมงและเทคโนโลยี (ปริญญาโท)",
    },
    "bangkhen_fish_563c2887": {
        "name_th": "วิทยาศาสตร์การประมงและเทคโนโลยี (ปริญญาเอก)",
    },
}


def _count(client, table: str, column: str, value: str) -> int:
    return client.table(table).select("id", count="exact").eq(column, value).execute().count or 0


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Apply changes; otherwise dry-run only.")
    args = parser.parse_args()

    load_dotenv(Path("../backend/.env"))
    load_dotenv(Path("backend/.env"))
    client = get_client()

    print("Program duplicate cleanup")
    print("mode:", "APPLY" if args.apply else "DRY-RUN")

    for old_id, new_id in MERGES.items():
        chunk_count = _count(client, "chunks", "program_id", old_id)
        tcas_count = _count(client, "tcas_records", "program_id", old_id)
        print(f"merge {old_id} -> {new_id}: delete {chunk_count} chunks, move {tcas_count} TCAS rows")
        if args.apply:
            if tcas_count:
                client.table("tcas_records").update({"program_id": new_id}).eq("program_id", old_id).execute()
            if chunk_count:
                client.table("chunks").delete().eq("program_id", old_id).execute()
            client.table("programs").delete().eq("id", old_id).execute()

    for program_id in sorted(DELETE_PROGRAM_IDS):
        chunk_count = _count(client, "chunks", "program_id", program_id)
        tcas_count = _count(client, "tcas_records", "program_id", program_id)
        print(f"delete stale {program_id}: delete {chunk_count} chunks, {tcas_count} TCAS rows remain")
        if args.apply:
            if chunk_count:
                client.table("chunks").delete().eq("program_id", program_id).execute()
            client.table("programs").delete().eq("id", program_id).execute()

    for program_id, update in PROGRAM_UPDATES.items():
        print(f"update names {program_id}: {update}")
        if args.apply:
            client.table("programs").update(update).eq("id", program_id).execute()

    print("done")


if __name__ == "__main__":
    main()
