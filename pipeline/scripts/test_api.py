"""
Standalone integration tests for the KUru Chat API.

Usage (from repo root):
    cd backend && uv run python ../scripts/test_api.py
    # or with a custom base URL:
    BASE_URL=http://localhost:8000 uv run python ../scripts/test_api.py

Requires:
    httpx (already a dev dependency in backend/pyproject.toml)

The script runs three scenarios and prints PASS/FAIL for each assertion.
Exit code is 0 only if every assertion passes.
"""

import os
import sys
import uuid

import httpx

BASE_URL = os.environ.get("BASE_URL", "http://localhost:8000").rstrip("/")
STUB_ANSWER = "ระบบ RAG กำลังอยู่ระหว่างการพัฒนา"


def _check(label: str, ok: bool) -> bool:
    status = "PASS" if ok else "FAIL"
    print(f"  [{status}] {label}")
    return ok


def _is_valid_uuid(value: str) -> bool:
    try:
        uuid.UUID(value)
        return True
    except (ValueError, AttributeError):
        return False


def health_check() -> bool:
    print("\n=== Health Check ===")
    r = httpx.get(f"{BASE_URL}/api/v1/health", timeout=10)
    ok = _check("GET /api/v1/health returns 200", r.status_code == 200)
    ok &= _check('body == {"status": "ok"}', r.json() == {"status": "ok"})
    return ok


def scenario_1_curriculum_query() -> bool:
    """Normal curriculum query — expects grounded answer, no TCAS data."""
    print("\n=== Scenario 1: Normal Curriculum Query ===")

    payload = {
        "message": "What courses will I take in Computer Engineering?",
        "program_context_id": None,
        "session_id": None,
        "conversation_history": [],
    }

    r = httpx.post(f"{BASE_URL}/api/v1/chat", json=payload, timeout=60)
    body = r.json()
    data = body.get("data", {})

    all_pass = True
    all_pass &= _check("HTTP 200", r.status_code == 200)
    all_pass &= _check("data.answer is non-empty", bool(data.get("answer")))
    all_pass &= _check(
        "data.session_id is a UUID", _is_valid_uuid(data.get("session_id", ""))
    )
    all_pass &= _check(
        "data.confidence_level in {high, medium, low}",
        data.get("confidence_level") in ("high", "medium", "low"),
    )
    all_pass &= _check("data.used_tcas_data is false", data.get("used_tcas_data") is False)
    all_pass &= _check("error is null", body.get("error") is None)

    # Warn (but don't fail) if we're in stub mode
    if STUB_ANSWER in (data.get("answer") or ""):
        print("  [WARN] RAG not available — stub response returned. "
              "Install kuru-pipeline for a real integration test.")
    elif data.get("confidence_level") == "high" or data.get("confidence_level") == "medium":
        all_pass &= _check(
            "data.sources non-empty when confidence is high/medium",
            len(data.get("sources", [])) >= 1,
        )

    return all_pass


def scenario_2_tcas_round_query() -> bool:
    """TCAS round query — expects used_tcas_data: true."""
    print("\n=== Scenario 2: TCAS Round Query ===")

    payload = {
        "message": "What are the TCAS3 score requirements for Computer Engineering?",
        "program_context_id": None,
        "session_id": None,
        "conversation_history": [],
    }

    r = httpx.post(f"{BASE_URL}/api/v1/chat", json=payload, timeout=60)
    body = r.json()
    data = body.get("data", {})

    all_pass = True
    all_pass &= _check("HTTP 200", r.status_code == 200)
    all_pass &= _check("data.answer is non-empty", bool(data.get("answer")))
    all_pass &= _check(
        "data.session_id is a UUID", _is_valid_uuid(data.get("session_id", ""))
    )
    all_pass &= _check(
        "data.confidence_level in {high, medium, low}",
        data.get("confidence_level") in ("high", "medium", "low"),
    )
    all_pass &= _check("error is null", body.get("error") is None)

    if STUB_ANSWER in (data.get("answer") or ""):
        print("  [WARN] RAG not available — stub response returned. "
              "used_tcas_data assertion skipped.")
    else:
        all_pass &= _check("data.used_tcas_data is true", data.get("used_tcas_data") is True)

    return all_pass


def scenario_3_unknown_program() -> bool:
    """Unknown program query — expects confidence_level: low and a no-data message."""
    print("\n=== Scenario 3: Unknown Program Query ===")

    payload = {
        "message": "What are the admission requirements for the Quantum Robotics Engineering program?",
        "program_context_id": None,
        "session_id": None,
        "conversation_history": [],
    }

    r = httpx.post(f"{BASE_URL}/api/v1/chat", json=payload, timeout=60)
    body = r.json()
    data = body.get("data", {})

    answer: str = data.get("answer") or ""

    # Keywords that would indicate a hallucinated / fabricated response
    hallucination_signals = [
        "Quantum Robotics",
        "quantum robotics",
        "คะแนนขั้นต่ำ",  # "minimum score" — should only appear in real TCAS data
    ]

    all_pass = True
    all_pass &= _check("HTTP 200", r.status_code == 200)
    all_pass &= _check("data.answer is non-empty", bool(answer))
    all_pass &= _check("data.confidence_level is low", data.get("confidence_level") == "low")
    all_pass &= _check("data.used_tcas_data is false", data.get("used_tcas_data") is False)
    all_pass &= _check("error is null", body.get("error") is None)
    all_pass &= _check(
        "answer does not contain hallucinated program specifics",
        not any(sig in answer for sig in hallucination_signals),
    )

    if STUB_ANSWER in answer:
        print("  [WARN] RAG not available — stub response returned. "
              "This scenario passes trivially in stub mode.")

    return all_pass


def main() -> int:
    print(f"KUru API Integration Tests — {BASE_URL}")

    results = [
        health_check(),
        scenario_1_curriculum_query(),
        scenario_2_tcas_round_query(),
        scenario_3_unknown_program(),
    ]

    passed = sum(results)
    total = len(results)
    print(f"\n{'='*40}")
    print(f"Results: {passed}/{total} scenario groups passed")

    return 0 if all(results) else 1


if __name__ == "__main__":
    sys.exit(main())
