# C3 Interface Testing — KUru Chat API

Base URL: `http://localhost:8000`  
All chat requests: `POST /api/v1/chat`  
Content-Type: `application/json`

---

## Scenario 1 — Normal Curriculum Query

**Goal:** Verify that a plain curriculum question returns a grounded answer with `confidence_level` of `"high"` or `"medium"` and at least one source chunk.

### Request

```json
POST /api/v1/chat
{
  "message": "What courses will I take in Computer Engineering?",
  "program_context_id": null,
  "session_id": null,
  "conversation_history": []
}
```

### Expected Response

```json
{
  "data": {
    "answer": "<Thai/English answer describing CE curriculum>",
    "session_id": "<uuid>",
    "confidence_level": "high",
    "sources": [
      {
        "source_file": "วิศวกรรมคอมพิวเตอร์_bangkhen.pdf",
        "section_type": "overview",
        "similarity": 0.72
      }
    ],
    "used_tcas_data": false
  },
  "sources": [],
  "error": null
}
```

### Pass/Fail Assertions

| # | Assertion | Expected |
|---|-----------|----------|
| 1 | HTTP status | `200` |
| 2 | `data.confidence_level` | `"high"` or `"medium"` |
| 3 | `data.sources` length | `>= 1` |
| 4 | `data.used_tcas_data` | `false` |
| 5 | `data.answer` | non-empty string |
| 6 | `data.session_id` | valid UUID string |
| 7 | `error` field | `null` |

### Challenges

- **RAG not wired in backend stub:** When `kuru` pipeline package is not installed, `chat.py` returns a stub answer (`confidence_level: "low"`, empty sources, `used_tcas_data: false`). The test must be run with the full pipeline installed or the stub path must be mocked. The stub case is detectable by checking `data.sources == []`.
- **Similarity threshold:** `confidence_level` is derived from the top chunk's cosine similarity (`>= 0.5 → high`, `>= 0.35 → medium`). If the CE curriculum PDF was not ingested, the score may fall below 0.35 and return `"low"`. Ensure `uv run kuru-ingest-mko` has been run for บางเขน before executing this scenario.

---

## Scenario 2 — TCAS Round Query (expects `used_tcas_data: true`)

**Goal:** Verify that a TCAS admission question triggers the structured TCAS record lookup and returns `used_tcas_data: true`.

### Request

```json
POST /api/v1/chat
{
  "message": "What are the TCAS3 score requirements for Computer Engineering?",
  "program_context_id": null,
  "session_id": null,
  "conversation_history": []
}
```

### Expected Response

```json
{
  "data": {
    "answer": "<answer referencing TCAS round 3 score requirements>",
    "session_id": "<uuid>",
    "confidence_level": "high",
    "sources": [
      {
        "source_file": "TCAS_round3_bangkhen.pdf",
        "section_type": "tcas",
        "similarity": 0.65
      }
    ],
    "used_tcas_data": true
  },
  "sources": [],
  "error": null
}
```

### Pass/Fail Assertions

| # | Assertion | Expected |
|---|-----------|----------|
| 1 | HTTP status | `200` |
| 2 | `data.used_tcas_data` | `true` |
| 3 | `data.sources` length | `>= 1` |
| 4 | `data.confidence_level` | `"high"` or `"medium"` |
| 5 | `data.answer` | non-empty string |
| 6 | `error` field | `null` |

### Challenges

- **TCAS keyword detection:** The RAG query engine uses `TCAS_KEYWORDS` regex. The word `"TCAS3"` must match the regex for the structured record path to activate. Confirm the keyword list includes `TCAS\d` pattern.
- **Round 3 records availability:** Only 1,061 round-3 records are currently ingested (from PDF + xlsx). If Computer Engineering does not appear in those records, `used_tcas_data` may be `false` even though the path was triggered (no matching records found). Check `uv run kuru-ingest-tcas` status.
- **Stub mode:** Same caveat as Scenario 1 — `used_tcas_data` will always be `false` in stub mode.

---

## Scenario 3 — Unknown Program Query (expects low confidence or no-data message)

**Goal:** Verify that a query about a non-existent program returns `confidence_level: "low"` and an honest "no data" message rather than a hallucinated answer.

### Request

```json
POST /api/v1/chat
{
  "message": "What are the admission requirements for the Quantum Robotics Engineering program?",
  "program_context_id": null,
  "session_id": null,
  "conversation_history": []
}
```

### Expected Response

```json
{
  "data": {
    "answer": "ขออภัย ไม่พบข้อมูลเกี่ยวกับหลักสูตรนี้ในฐานข้อมูลของเรา",
    "session_id": "<uuid>",
    "confidence_level": "low",
    "sources": [],
    "used_tcas_data": false
  },
  "sources": [],
  "error": null
}
```

### Pass/Fail Assertions

| # | Assertion | Expected |
|---|-----------|----------|
| 1 | HTTP status | `200` |
| 2 | `data.confidence_level` | `"low"` |
| 3 | `data.used_tcas_data` | `false` |
| 4 | `data.answer` | non-empty string (honest no-data message) |
| 5 | `data.answer` does NOT contain fabricated specifics | no invented score numbers or course names |
| 6 | `error` field | `null` |

### Challenges

- **No-LLM short-circuit:** The RAG engine skips the Gemini call entirely when no chunks and no TCAS records are found, returning a hardcoded Thai message. This is the expected path for an unknown program. If the engine still calls Gemini (e.g. there were partial vector matches), the answer text will vary — so assertion 4 checks for non-empty rather than exact text.
- **Partial matches on common words:** "Engineering" exists in many KU program names, so pgvector may return low-similarity chunks from real programs. `confidence_level` is computed from `sources[0].similarity`; as long as no chunk exceeds 0.35 similarity, it will correctly be `"low"`. Use a clearly fictitious program name to avoid this.
- **Stub mode:** In stub mode, this scenario passes assertions trivially because the stub always returns `confidence_level: "low"` and empty sources — but for the wrong reason. Add a check that `data.answer` is NOT the stub Thai message to distinguish real from stub behavior.
- **Citation click-through is not part of the POC contract:** The interface test verifies that source metadata is returned and rendered as citation chips. It does not require clicking a chip to open the exact source PDF/page/chunk because `ChatSourceChunk` currently exposes `source_file`, `section_type`, and `similarity`, but not a stable `chunk_id`, page number, or source URL. This should be tested as a Phase 2 source-inspection enhancement.
