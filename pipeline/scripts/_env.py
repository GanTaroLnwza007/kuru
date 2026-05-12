"""Shared environment loading for ad-hoc pipeline scripts."""

from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv


def load_project_env(script_file: str) -> None:
    """Load repo-level secrets first, then pipeline-local defaults."""
    script_path = Path(script_file).resolve()
    pipeline_dir = script_path.parents[1]
    repo_root = pipeline_dir.parent

    load_dotenv(dotenv_path=repo_root / "backend" / ".env")
    load_dotenv(dotenv_path=pipeline_dir / ".env", override=False)
