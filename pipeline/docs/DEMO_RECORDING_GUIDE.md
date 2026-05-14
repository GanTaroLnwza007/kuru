# KUru POC Demo Recording Guide

Use this as the script/checklist for the demo video. The goal is to show the viewer what KUru can do, prove the AI-enabled pieces are real, and be honest about the current POC limitations.

## Recommended Demo Order

| Scene | Feature to show | What it proves | Suggested time |
|---|---|---|---|
| 1 | Repo/readme and grader guide | The submission is navigable and deliverables are easy to find | 30-45 sec |
| 2 | Backend health check | FastAPI model service is running and RAG is ready | 20-30 sec |
| 3 | Chat: curriculum answer | RAG retrieves curriculum chunks and answers with citations | 1-2 min |
| 4 | Chat: TCAS/admission answer | TCAS classifier and structured admission data are connected | 1-2 min |
| 5 | Chat: fee answer | Structured fee grounding works for known fee records | 45-60 sec |
| 6 | Chat: no-data / limitation case | The system avoids overconfident hallucination when data is missing | 45-60 sec |
| 7 | Citations, confidence, feedback buttons | The UI exposes uncertainty, provenance, and user feedback | 45-60 sec |
| 8 | Program Explorer / RIASEC UI | The product is more than a raw chatbot; it supports student exploration | 1-2 min |
| 9 | MLflow evidence | B4 experiment tracking and selected run are documented | 45-60 sec |
| 10 | Wrap-up limitations and next steps | Honest reflection for grading criteria | 30-45 sec |

Target length: 7-10 minutes.

## Pre-Demo Setup

Start the backend:

```powershell
cd backend
uv run uvicorn main:app --reload --port 8000
```

Confirm health:

```powershell
curl http://localhost:8000/api/v1/health
```

Expected:

```json
{
  "status": "ok",
  "rag": {
    "available": true,
    "ready": true,
    "error": null
  }
}
```

Start the frontend:

```powershell
cd frontend
npm run dev
```

Use this frontend env:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_USE_MOCK_CHAT=false
```

Optional MLflow UI:

```powershell
cd pipeline
uv run mlflow ui --backend-store-uri sqlite:///mlflow.db --port 5000
```

Open:

```text
http://localhost:3000
http://localhost:5000
```

## Model and Provider Wording

Use this exact phrasing in the demo:

> KUru uses three AI components. The retriever is the local `intfloat/multilingual-e5-base` embedding model. The live chat answer generator is Gemini 2.5 Flash Lite through OpenRouter. Typhoon OCR is used during ingestion for low-yield scanned/image pages, so many recent OCR repairs show up as Typhoon usage rather than Gemini usage.

Do not say Typhoon is the chatbot model. Do not say Gemini did all OCR. The honest split is:

| Task | Provider/model |
|---|---|
| Retrieval embeddings | Local `intfloat/multilingual-e5-base` |
| Chat answer generation | Gemini 2.5 Flash Lite via OpenRouter |
| LLM-as-judge evaluation | Gemini via OpenRouter |
| Structured extraction | Gemini text mode |
| Low-yield page OCR | Typhoon OCR |

## Chat Prompts to Record

### 1. Curriculum Query

Prompt:

```text
What courses will I take in Computer Engineering?
```

Show:

- English answer because the prompt is English.
- Confidence badge should be medium/high.
- Citation chips should show source file, section type, and similarity.
- `used_tcas_data` should be false.

Narration:

> This demonstrates the normal RAG path: the user asks a curriculum question, KUru embeds the query, searches pgvector, reranks Thai/English chunks, and sends grounded context to Gemini.

### 2. TCAS / Admission Query

Prompt:

```text
software and knowledge engineering เข้ายังไง
```

Show:

- Thai answer because the prompt is Thai/mixed.
- Answer should mention admission/TCAS style information.
- Citation chips should include TCAS-like sources when available.
- `used_tcas_data` should be true or the answer should clearly describe the admission records it found.

Narration:

> This shows the TCAS-aware branch. KUru does not rely only on vector chunks; it also checks structured TCAS records when the question is about admission.

### 3. Fee Query

Prompt:

```text
ค่าเทอมของวิศวกรรมซอฟต์แวร์เท่าไหร่
```

Show:

- Thai answer.
- Fee numbers should only be shown when backed by `programs.fees` or fee evidence.
- If the exact program fee is missing, KUru should say the data is unavailable instead of borrowing another program's tuition.

Narration:

> We added structured fee grounding because fee numbers are high-risk facts. The system should prefer saying "not found" over hallucinating a tuition amount.

### 4. Thai PLO Query

Prompt:

```text
วิศวกรรมคอมพิวเตอร์เรียนจบแล้วทำอะไรได้บ้าง
```

Show:

- Thai answer.
- Program/career/PLO style explanation.
- Citation chips remain visible.

Narration:

> This demonstrates bilingual behavior and student-facing explanation, not only raw retrieval.

### 5. No-Data / Hallucination Guard

Prompt:

```text
What are the admission requirements for the Quantum Robotics Engineering program?
```

Show:

- Low confidence or no-data style answer.
- No invented GPAX, seat count, score, or course list.

Narration:

> This is an important failure-mode demo. KUru is not perfect, but the POC tries to fail safely by avoiding fabricated details when the source data is not present.

### 6. Conversation Memory

Prompt 1:

```text
What courses will I take in Computer Engineering?
```

Prompt 2:

```text
What about admission requirements for that program?
```

Show:

- The second answer should use conversation history to understand "that program".

Narration:

> This shows that the frontend sends recent conversation turns to the backend, so follow-up questions can preserve context.

## UI Features to Point Out

| UI element | What to say |
|---|---|
| Confidence badge | It is based on retrieval similarity and warns users when evidence is weak. |
| Citation chips | They show source provenance: filename, section type, and similarity. |
| Feedback buttons | Thumbs up/down writes a rating through `POST /api/v1/chat/feedback` into Supabase. |
| Thai/English answers | The response language follows the user's query: Thai/mixed prompts should answer in Thai, English prompts in English. |
| Program Explorer | Shows structured program data outside the chatbot, useful for browsing before asking questions. |
| RIASEC UI | Demonstrates the intended student preference discovery flow for program matching. |

## Feedback Feature: Is It Enough for the POC?

Yes, the current feedback mechanism should pass the POC requirement for user feedback collection:

- Each answer has thumbs up / thumbs down buttons.
- One click is enough; no form is required.
- The frontend calls `POST /api/v1/chat/feedback`.
- The backend writes `session_id`, `question`, `answer`, and `rating` to the Supabase `feedback` table.

Be honest in the demo:

> In this POC, feedback is collected and stored for review. It does not automatically retrain the model yet. The next step is to aggregate low-rated answers, turn them into regression eval cases, and prioritize re-ingestion or prompt fixes for the affected program/section.

## Citation Limitation to Mention

Current behavior:

- Citation chips show where an answer came from.
- Users cannot click a chip to open the exact PDF page, extracted chunk, or Google Drive file.

How to say it:

> The current POC exposes source provenance but not source click-through. This is documented as a Phase 2 transparency improvement. To implement it, the backend should return stable `chunk_id`, page number, and `source_url` fields, then the frontend can open a PDF page or source-preview panel.

Do not present clickable citations as completed.

## MLflow Scene

Open MLflow:

```text
http://localhost:5000
```

Show:

- Experiment: `kuru-rag-hyperparameter-search`
- Selected production regression run: `v8_structured_tcas_fees`
- Headline retrieval benchmark: `latest_submission_headline_v7_rerank_74pct`
- Metrics such as `pct_good`, `avg_score`, `n_valid`, and section-specific score charts.

Narration:

> We treat RAG training as retrieval/evaluation tuning: ingestion cleanup, chunking, embedding, reranking, structured TCAS/fee grounding, and LLM-as-judge scoring. MLflow records the experimental runs and justifies why the selected behavior is used.

## Honest Limitations to Include

Say these clearly:

- The model is only as good as the ingested KU source data.
- Some scanned PDFs and table-heavy curriculum sections are still noisy.
- Citation chips are visible but not clickable to exact source pages yet.
- The feedback loop stores ratings but does not perform automatic retraining.
- RIASEC recommendation is a lightweight exploration aid, not a definitive career diagnosis.
- The current data scope focuses on KU Bangkhen and selected TCAS/fee records.

## Closing Script

Use this ending:

> KUru demonstrates an AI-enabled university advising workflow: students can explore programs, ask bilingual questions, get grounded answers with citations and confidence, and provide feedback. The strongest part of the POC is the end-to-end connection from official curriculum/TCAS data to a deployed FastAPI model service and student-facing UI. The next improvements are clickable source inspection, broader campus coverage, stronger OCR cleanup, and using feedback ratings as regression tests for future evaluation.
