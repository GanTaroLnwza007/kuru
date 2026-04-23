# KUru: An AI-Powered Academic Pathway Advisor for KU Students

## 1. Project Overview

KUru is an AI-powered academic pathway advisor designed for students exploring programs at Kasetsart University (KU).

The system helps students answer:
- What should I study?
- What skills will I gain?
- What careers will it lead to?
- How do I get in (TCAS)?

KUru connects:
**Student Interests → Program PLOs → Career Skills → TCAS Pathways**

---

## 2. Target Users

### Primary Users
- High school students (M4–M6)
- Gap-year students
- Pre-admission users exploring KU programs

### Key Characteristics
- No prior knowledge (cold-start problem)
- Overwhelmed by information
- Need clear, explainable guidance

---

## 3. Problem Statement

### 3.1 PLO Documents Are Inaccessible
- มคอ.2 is difficult to read
- Written for accreditation, not students

### 3.2 TCAS System is Complex
- Multiple rounds and requirements
- High risk of wrong decision

### 3.3 Limited Career Awareness
- Students only know a small set of careers
- Cannot map interests → real jobs

---

## 4. Core Features (MVP)

### 4.1 KUru Chatbot (RAG-based)
Conversational AI for:
- Program information
- Career pathways
- TCAS guidance

**Technology:**
- RAG Pipeline
- Gemini 2.5 Flash
- Gemini-Embedding-001

---

### 4.2 Recommendation System (RIASEC-based)

A short (3–5 minutes) personality test that:
- Builds interest profile
- Maps to skill clusters
- Matches programs

**Output:**
- Recommended KU programs
- Career matches
- Skill explanation

---

### 4.3 Program Explorer

Static + dynamic content:
- Browse KU programs
- View PLOs
- Navigate to chatbot

---

## 5. Data Sources

| Data | Description |
|------|------------|
| KU Curriculum (มคอ.2) | Program learning outcomes (PLOs) |
| O*NET Database | Career skills and requirements |
| TCAS Data | Admission rules and requirements |

---

## 6. System Architecture

### 6.1 High-Level Architecture

```

User → Frontend → Backend API → AI Systems
→ Vector DB
→ Graph DB

```

---

## 7. AI Architecture

### 7.1 RAG Pipeline (Chatbot)

**Flow:**
1. User query
2. Embed query using Gemini-Embedding-001
3. Retrieve relevant documents (pgvector)
4. Send context + query to Gemini 2.5 Flash
5. Generate grounded answer with citations

---

### 7.2 Recommendation Pipeline

**Step 1 — Interest Profiling**
- Based on RIASEC model

**Step 2 — Career Matching**
- Compare with O*NET using cosine similarity

**Step 3 — Skill Extraction**
- Aggregate required skills

**Step 4 — Program Matching**
- Match skills with KU PLOs

**Step 5 — Explanation Generation**
- Gemini 2.5 Flash generates human-readable explanation

---

## 8. Data Pipeline

### 8.1 มคอ.2 Processing

1. PDF extraction (PyMuPDF)
2. Text chunking
3. Embedding (Gemini-Embedding-001)
4. Store in pgvector
5. Tag metadata

---

### 8.2 Knowledge Graph (Neo4j)

Schema:

```

Faculty → PLO → Skill → Career

```

---

## 9. Technology Stack

### Frontend
- Next.js 14
- Tailwind CSS
- Shadcn/UI

### Backend
- FastAPI (Python)

### AI
- LLM: Gemini 2.5 Flash
- Embeddings: Gemini-Embedding-001

### Database
- Supabase (PostgreSQL + pgvector)
- Neo4j (Graph DB)

### Deployment
- Vercel (Frontend)
- Railway (Backend + Neo4j)

---

## 10. Evaluation Metrics

### RAG System
- Faithfulness (RAGAS) > 0.80
- Relevance > 0.75

### Recommendation System
- MRR / NDCG@5 > 0.60

### Usability
- SUS Score > 70
- Task Completion Rate > 80%

---

## 11. Project Timeline (12 Weeks)

| Weeks | Phase | Deliverables |
|------|------|-------------|
| 1–2 | Data Collection | Gather datasets |
| 3–4 | Data Pipeline | Embedding + Graph setup |
| 5–6 | AI Core | RAG + Recommendation |
| 7–9 | Frontend | UI + UX |
| 10–11 | Evaluation | Testing + Metrics |
| 12 | Final | Demo + Report |

---

## 12. Competitive Advantage

KUru is the only system that integrates:
- Student interests
- KU curriculum (PLOs)
- Career skills (O*NET)
- TCAS admission system

All in one platform.

---

## 13. Future Work (Phase 2)

- Skill progress tracker
- Elective recommender
- Career readiness report
- Collaborative filtering

---

## 14. Key Innovation

- Solves cold-start problem using RIASEC
- Uses real KU curriculum data (not hallucination)
- Explainable AI recommendations
- Hybrid system (RAG + Graph + Recommender)

---

## 15. One-Line Summary

KUru transforms disconnected academic and career data into a unified, explainable AI system that helps students confidently choose their future.
