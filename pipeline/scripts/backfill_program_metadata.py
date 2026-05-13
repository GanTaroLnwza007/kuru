"""Backfill safe derived metadata on programs.

This fills fields that can be derived without an LLM:
- slug: stable URL-friendly slug from name_en
- year_by_year_vibe: generic Thai summary by degree/name
- coverage: only when missing, using existing structured fields and chunk counts

Run from `pipeline/`:
    uv run python scripts/backfill_program_metadata.py
    uv run python scripts/backfill_program_metadata.py --apply
"""

from __future__ import annotations

import argparse
import re
from collections import Counter
from pathlib import Path

from dotenv import load_dotenv

from kuru.db.supabase_client import get_client


def slugify(name: str, existing: set[str], program_id: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    slug = re.sub(r"-+", "-", slug)[:80].strip("-") or program_id.lower().replace("_", "-")
    base = slug
    suffix = 2
    while slug in existing:
        slug = f"{base}-{suffix}"
        suffix += 1
    existing.add(slug)
    return slug


def vibe(name_th: str, degree_level: str) -> str:
    label = f"หลักสูตร{name_th}"
    if degree_level == "doctoral":
        return (
            f"{label}เน้นการวิจัยขั้นสูง การอ่านงานวิชาการเชิงลึก "
            "และการพัฒนาองค์ความรู้ใหม่ผ่านวิทยานิพนธ์ โดยผู้เรียนค่อยๆ สร้างความเชี่ยวชาญเฉพาะทางร่วมกับอาจารย์ที่ปรึกษา"
        )
    if degree_level == "master":
        return (
            f"{label}ต่อยอดความรู้เฉพาะทางจากระดับปริญญาตรี "
            "ช่วงแรกเน้นทฤษฎีและเครื่องมือวิชาชีพ ช่วงท้ายเน้นงานวิจัย โครงงาน หรือการประยุกต์ใช้ในบริบทจริง"
        )
    return (
        f"{label}เริ่มจากพื้นฐานของสาขาและรายวิชาศึกษาทั่วไป "
        "ก่อนค่อยๆ เพิ่มรายวิชาเฉพาะทาง การฝึกปฏิบัติ โครงงาน และประสบการณ์ที่เชื่อมกับงานจริงในช่วงปีท้ายๆ"
    )


def build_coverage(program: dict, chunk_count: int) -> dict:
    courses = program.get("courses") or []
    plos = program.get("plos") or []
    year_timeline = program.get("year_timeline") or []
    curriculum_mapping = program.get("curriculum_mapping") or []
    return {
        "extraction_method": "unknown_existing_chunks" if chunk_count else "no_chunks",
        "has_overview": bool(program.get("overview")),
        "has_plos": bool(plos),
        "plo_count": len(plos),
        "has_courses": bool(courses),
        "course_count": len(courses),
        "has_timeline": bool(year_timeline),
        "has_curriculum_mapping": bool(curriculum_mapping),
        "chunk_count": chunk_count,
        "name_en_source": "backfilled" if program.get("name_en") else None,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Apply updates; otherwise dry-run only.")
    args = parser.parse_args()

    load_dotenv(Path("../backend/.env"))
    load_dotenv(Path("backend/.env"))
    client = get_client()

    programs = client.table("programs").select("*").limit(1000).execute().data or []

    chunk_counts: Counter[str] = Counter()
    start = 0
    while True:
        page = client.table("chunks").select("program_id").range(start, start + 999).execute().data or []
        chunk_counts.update(row["program_id"] for row in page)
        if len(page) < 1000:
            break
        start += 1000

    existing_slugs = {p["slug"] for p in programs if p.get("slug")}
    updates = []
    for program in sorted(programs, key=lambda row: row["id"]):
        update: dict = {}
        if not program.get("slug"):
            update["slug"] = slugify(program.get("name_en") or program.get("name_th") or program["id"], existing_slugs, program["id"])
        if not program.get("year_by_year_vibe"):
            update["year_by_year_vibe"] = vibe(program.get("name_th") or program.get("name_en") or "นี้", program.get("degree_level") or "bachelor")
        if not program.get("coverage"):
            update["coverage"] = build_coverage(program, chunk_counts[program["id"]])
        if update:
            updates.append((program["id"], update))

    print("Programs needing metadata update:", len(updates))
    for program_id, update in updates:
        print(program_id, update)
        if args.apply:
            client.table("programs").update(update).eq("id", program_id).execute()


if __name__ == "__main__":
    main()
