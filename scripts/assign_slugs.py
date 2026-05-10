"""Assign URL-friendly slugs and generate year_by_year_vibe for the 20 selected programs.

Run AFTER migration 002_add_slug_year_vibe.sql has been applied in Supabase.
Safe to run multiple times (idempotent).
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv(dotenv_path=Path(__file__).parent.parent / "backend" / ".env")

# Canonical 20 programs: hash_id → slug
# bangkhen_0a75bd0f (SKE IUP) was removed from DB; replaced with bangkhen_65e17156 (Industrial Eng)
SLUG_MAP: dict[str, str] = {
    "bangkhen_978e034a": "civil-water",
    "bangkhen_ef87a252": "earth-science",
    "bangkhen_f59cc529": "psychology",
    "bangkhen_bbc3aed6": "history",
    "bangkhen_45012e1a": "law",
    "bangkhen_b329a2c4": "sociology",
    "bangkhen_5b6f81ed": "vet-tech",
    "bangkhen_a612dbb4": "chemical-eng",
    "bangkhen_ddf705a9": "computer-eng",
    "bangkhen_95070360": "civil-eng",
    "bangkhen_57bbf1ac": "electrical-eng",
    "bangkhen_282b5991": "materials-eng",
    "bangkhen_11a20d3f": "environmental-eng",
    "bangkhen_65e17156": "industrial-eng",
    "bangkhen_b3439795": "mechanical-eng",
    "bangkhen_df395fd7": "aerospace-eng",
    "bangkhen_490b53ef": "semiconductor-eng",
    "bangkhen_13e0215f": "nursing",
    "bangkhen_6471b30d": "political-science",
    "bangkhen_1ca687c1": "ske-intl",
}


def _make_vibe(year_timeline: list[dict]) -> str:
    """Condense year_timeline narratives into a short multi-year summary string."""
    if not year_timeline:
        return ""
    sorted_years = sorted(year_timeline, key=lambda x: int(x.get("year", 0)))
    parts: list[str] = []
    for item in sorted_years[:4]:
        narrative: str = item.get("narrative", "").strip()
        if not narrative:
            continue
        # Take up to the first 110 characters to keep it concise
        short = narrative[:110].rsplit(" ", 1)[0] if len(narrative) > 110 else narrative
        parts.append(f"ปีที่ {item['year']}: {short}")
    return " | ".join(parts)


def main() -> None:
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_KEY", "")
    if not url or not key:
        raise SystemExit("SUPABASE_URL and SUPABASE_KEY must be set in backend/.env")

    client: Client = create_client(url, key)

    updated = 0
    for hash_id, slug in SLUG_MAP.items():
        # Query each program individually to avoid .in_() pagination limits
        resp = client.table("programs").select("id,slug,year_timeline,year_by_year_vibe").eq("id", hash_id).execute()
        if not resp.data:
            print(f"  SKIP  {hash_id!r} — not found in DB")
            continue
        row = resp.data[0]

        patch: dict[str, str] = {}

        if row.get("slug") != slug:
            patch["slug"] = slug

        if not row.get("year_by_year_vibe"):
            yt = row.get("year_timeline") or []
            vibe = _make_vibe(yt) if isinstance(yt, list) else ""
            if vibe:
                patch["year_by_year_vibe"] = vibe

        if patch:
            client.table("programs").update(patch).eq("id", hash_id).execute()
            print(f"  OK    {slug:<25} ({hash_id})")
            if "year_by_year_vibe" in patch:
                preview = patch["year_by_year_vibe"][:80]
                print(f"         vibe: {preview}…")
            updated += 1
        else:
            print(f"  --    {slug:<25} already up-to-date")

    print(f"\n✓ Done — {updated} programs updated")


if __name__ == "__main__":
    main()
