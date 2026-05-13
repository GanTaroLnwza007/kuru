# -*- coding: utf-8 -*-
"""Generate a golden eval set from ingested Supabase chunks using OpenRouter (Gemini).

Usage:
    uv run python scripts/generate_eval_set.py
    uv run python scripts/generate_eval_set.py --target 50 --out data/eval_set.csv

Output CSV columns: question, ground_truth_answer, source_file, program_id, question_type, section_type
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from dotenv import load_dotenv

load_dotenv()

from kuru.db import supabase_client as db
from kuru.llm import GENERATION_MODEL, get_openrouter_client, session_usage

# ── Prompt ───────────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are an expert at creating evaluation datasets for Thai university RAG chatbots.
Given a passage from a KU (Kasetsart University) curriculum document, generate realistic questions
that a Thai prospective student or current student would actually ask, along with answers grounded
strictly in the passage.

Rules:
- Questions must be answerable from the passage alone — no outside knowledge
- ALWAYS include the full program name in the question (never use "this program", "this curriculum", "the program", etc.)
- Only ask about Kasetsart University (KU / มก.) programs — never mention other universities
- Mix Thai and English questions naturally (Thai students ask in both languages)
- Keep answers concise and factual (1-3 sentences)
- Vary question types: admission, curriculum content, program details, PLOs
- Do not create questions about corrupted/OCR-garbled course names or unreadable text
- Output valid JSON only — no markdown, no explanation"""

_USER_TEMPLATE = """Passage (from program: {program_name}, file: {source_file}, section: {section_type}):
---
{content}
---

Generate {n} question-answer pairs about the {program_name} program at KU.
IMPORTANT: Every question must explicitly name the program "{program_name}".

Output JSON array:
[
  {{
    "question": "...",
    "answer": "...",
    "question_type": "tcas|curriculum|plo|general|admission"
  }}
]"""


def _generate_qa(content: str, source_file: str, section_type: str, program_name: str, n: int = 2) -> list[dict]:
    """Call OpenRouter to generate n Q&A pairs from a passage. Returns [] on failure."""
    prompt = _USER_TEMPLATE.format(
        source_file=source_file, section_type=section_type,
        content=content[:1500], n=n, program_name=program_name,
    )
    try:
        response = get_openrouter_client().chat.completions.create(
            model=GENERATION_MODEL,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
            max_tokens=800,
        )
        if response.usage:
            session_usage.add(GENERATION_MODEL, response.usage)
        raw = (response.choices[0].message.content or "").strip()
        # Strip markdown code fences if model wrapped output
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except Exception as exc:
        print(f"  [warn] generation failed: {exc}")
        return []


def _looks_corrupt(text: str) -> bool:
    """Reject visibly OCR-corrupted generated text."""
    if not text.strip():
        return True

    suspicious = [
        "เทคนิโส",
        "ถู้",
        "กรรมสพ",
        "????",
        "undefined",
        "null",
    ]
    lowered = text.lower()
    if any(s in lowered for s in suspicious):
        return True

    return False


def _sample_chunks(client, programs: list[dict], target_chunks: int) -> list[dict]:
    """Sample a balanced set of chunks across current programs and section types."""
    section_targets = {
        "course": max(1, round(target_chunks * 0.45)),
        "admission": max(1, round(target_chunks * 0.30)),
        "plo": max(1, round(target_chunks * 0.15)),
        "general": max(1, target_chunks),
    }
    section_targets["general"] = max(
        1,
        target_chunks - sum(v for k, v in section_targets.items() if k != "general"),
    )

    samples: list[dict] = []
    seen_keys: set[tuple[str, str, str]] = set()

    for section, target in section_targets.items():
        section_count = 0
        for prog in programs:
            if section_count >= target or len(samples) >= target_chunks:
                break

            pid = prog["id"]
            rows = (
                client.table("chunks")
                .select("content,source_file,section_type,program_id")
                .eq("program_id", pid)
                .eq("section_type", section)
                .limit(3)
                .execute()
            )
            for row in rows.data or []:
                content = (row.get("content") or "").strip()
                key = (pid, section, row.get("source_file", ""))
                if key in seen_keys or len(content) <= 200:
                    continue

                row["name_th"] = prog.get("name_th") or prog.get("name_en") or pid
                samples.append(row)
                seen_keys.add(key)
                section_count += 1
                break

    return samples[:target_chunks]


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate golden eval set from Supabase chunks")
    parser.add_argument("--target", type=int, default=50, help="Target number of Q&A pairs")
    parser.add_argument("--out", default="data/eval_set.csv", help="Output CSV path")
    parser.add_argument("--qa-per-chunk", type=int, default=2, help="Q&A pairs per chunk")
    args = parser.parse_args()

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    client = db.get_client()
    programs = db.get_programs(client)
    # Only programs with actual chunk data
    valid_programs = [p for p in programs if p.get("name_th") and "แบบ" not in (p.get("name_th") or "")]
    print(f"Found {len(valid_programs)} valid programs to sample from")

    # Oversample a little so filtering OCR-corrupted pairs still leaves enough rows.
    chunks_needed = -(-(args.target + max(4, args.target // 4)) // args.qa_per_chunk)
    samples = _sample_chunks(client, valid_programs, target_chunks=chunks_needed)
    print(f"Sampled {len(samples)} chunks → targeting {len(samples) * args.qa_per_chunk} Q&A pairs\n")

    rows: list[dict] = []
    for i, chunk in enumerate(samples):
        if len(rows) >= args.target:
            break
        src = chunk.get("source_file", "")
        sec = chunk.get("section_type", "general")
        prog_id = chunk.get("program_id", "")
        name_th = chunk.get("name_th", "")

        print(f"  [{i+1}/{len(samples)}] {name_th[:30]:30s} [{sec}] → ", end="", flush=True)
        pairs = _generate_qa(chunk["content"], src, sec, program_name=name_th, n=args.qa_per_chunk)
        print(f"{len(pairs)} pairs  (~${session_usage.estimated_cost_usd:.4f} spent)")

        for pair in pairs:
            question = pair.get("question", "")
            answer = pair.get("answer", "")
            if _looks_corrupt(question) or _looks_corrupt(answer):
                print("    [skip] OCR-corrupted generated pair")
                continue
            rows.append({
                "question":           question,
                "ground_truth_answer": answer,
                "question_type":      pair.get("question_type", "general"),
                "source_file":        src,
                "program_id":         prog_id,
                "section_type":       sec,
            })

    rows = rows[: args.target]
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["question", "ground_truth_answer", "question_type",
                                               "source_file", "program_id", "section_type"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nWrote {len(rows)} Q&A pairs → {out_path}")
    print(f"API usage: {session_usage.summary()}")


if __name__ == "__main__":
    main()
