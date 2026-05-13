# -*- coding: utf-8 -*-
"""Remap eval-set program IDs after duplicate program cleanup.

Run from `pipeline/`:
    uv run python scripts/remap_eval_program_ids.py --eval data/eval_set_v2.csv --out data/eval_set_v3_after_cleanup.csv
"""

from __future__ import annotations

import argparse
import csv
from pathlib import Path

from cleanup_program_duplicates import MERGES


def main() -> None:
    parser = argparse.ArgumentParser(description="Remap stale eval program IDs to kept IDs")
    parser.add_argument("--eval", default="data/eval_set_v2.csv", help="Input eval CSV")
    parser.add_argument("--out", default="data/eval_set_v3_after_cleanup.csv", help="Output eval CSV")
    args = parser.parse_args()

    eval_path = Path(args.eval)
    out_path = Path(args.out)

    with eval_path.open(encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fieldnames = reader.fieldnames or []

    remapped = 0
    for row in rows:
        old_id = row.get("program_id", "")
        new_id = MERGES.get(old_id)
        if new_id:
            row["program_id"] = new_id
            remapped += 1

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"wrote {out_path}")
    print(f"rows: {len(rows)}")
    print(f"remapped: {remapped}")


if __name__ == "__main__":
    main()
