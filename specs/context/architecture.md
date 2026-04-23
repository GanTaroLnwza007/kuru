# architecture.md
> Source of truth for KUru's system design. Every agent task touching infrastructure must align with this document.

---

## 1. Project Overview

**KUru** is an AI-powered PLO-to-career navigator for Grade 12 (M6) students exploring Kasetsart University programs. It transforms official academic documents (มคอ.2) and TCAS requirements into explainable, grounded career and program recommendations.

- **Primary users:** M6 / Grade 12 students (pre-admission)
- **Core constraint:** All AI responses must be grounded in official KU data with source citations. No hallucinated program details.

---

## 2. Tech Stack

### Frontend
| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) | Use server components by default; client components only when interactivity requires it |
| UI Library | Shadcn/UI + Tailwind CSS | Do not introduce other component libraries |
| State | Zustand | For cross-component state (e.g. RIASEC session, chat history) |
| Routing | Next.js App Router | File-based, no pages/ directory |

### Backend
| Layer | Choice | Notes |
|---|---|---|
| Framework | FastAPI (Python) | All RAG pipeline and AI orchestration logic lives here |
| Auth | Supabase Auth | JWT passed from frontend; validated in FastAPI middleware |
| Task Queue | Celery + Redis | For async portfolio analysis jobs |

### AI Layer
| Component | Choice | Notes |
|---|---|---|
| Generation model | Gemini 2.5 Flash | Used for all chat responses and portfolio gap analysis |
| Embedding model | gemini-embedding-001 | Used for all vector embedding tasks (PLOs, careers, student input) |
| Orchestration | LangChain (Python) | RAG pipeline construction; prompt templates managed here |

### Data Layer
| Store | Purpose | Notes |
|---|---|---|
| Supabase (PostgreSQL) | Primary relational store: programs, PLOs, TCAS data, user sessions | Enable Row-Level Security for all user data |
| pgvector (extension) | Semantic similarity search over PLO and career embeddings | All vector columns use `vector(768)` (gemini-embedding-001 dimension) |
| Neo4j | SkillCluster knowledge graph: `(Program)-[:HAS_PLO]->(PLO)-[:MAPS_TO]->(SkillCluster)-[:ALIGNS_WITH]->(Career)` | Read-only from FastAPI; updated only via admin pipeline |

---

## 3. System Architecture Diagram

```
[Next.js Frontend]
       |
       | HTTPS + JWT
       v
[FastAPI Backend]
  ├── RAG Pipeline (LangChain)
  │     ├── Query → gemini-embedding-001 → pgvector similarity search
  │     ├── Retrieved chunks → Gemini 2.5 Flash → grounded response
  │     └── Source citations attached to every response
  ├── RIASEC Engine
  │     ├── Adaptive question selector
  │     ├── Pairwise + scenario scoring
  │     └── Score → SkillCluster → Program mapping (via Neo4j)
  ├── Portfolio Coach
  │     ├── Student portfolio input
  │     ├── Criteria retrieval per program (Supabase)
  │     └── Gap analysis → Gemini 2.5 Flash → structured report
  └── Program Explorer
        └── Semantic search query → pgvector → ranked program list

[Supabase]                    [Neo4j]
  ├── programs                  └── SkillCluster graph
  ├── plos                          (Program→PLO→Cluster→Career)
  ├── careers
  ├── tcas_requirements
  ├── portfolio_criteria
  └── user_sessions

[Redis]
  └── Celery task queue (portfolio jobs)
```

---

## 4. Data Flow by Feature

### RAG Chatbot
1. User sends question → Frontend → FastAPI `/chat` endpoint
2. FastAPI embeds question via `gemini-embedding-001`
3. pgvector similarity search over `plos`, `programs`, `tcas_requirements` tables
4. Top-k chunks passed as context to Gemini 2.5 Flash with grounding prompt
5. Response returned with `sources[]` array (table + row references)
6. Frontend renders response with citation UI

### RIASEC System
1. User starts test → Frontend → FastAPI `/riasec/start`
2. Adaptive engine selects next question based on current score distribution
3. User submits answers → scores accumulated per RIASEC dimension
4. Final scores → Neo4j query: match SkillClusters → match Programs
5. Ranked program list returned with explanation per cluster match

### Program Explorer
1. User enters search query → FastAPI `/programs/search`
2. Query embedded → pgvector search over `programs` + `plos` tables
3. Ranked results returned with `year_by_year_vibe` field (pre-computed summary)

### Portfolio Coach
1. User selects program + submits portfolio data → FastAPI `/portfolio/analyze`
2. Program criteria fetched from `portfolio_criteria` table
3. Async gap analysis job dispatched via Celery
4. Gemini 2.5 Flash generates structured gap report
5. Result stored in `user_sessions`; frontend polls for completion

---

## 5. API Conventions

- **Base URL:** `/api/v1/`
- **Auth header:** `Authorization: Bearer <supabase_jwt>`
- **Response envelope:**
  ```json
  {
    "data": {},
    "sources": [],
    "error": null
  }
  ```
- **Grounding rule:** Any endpoint that invokes Gemini must return a non-empty `sources[]`. If no sources are found, return an error rather than an ungrounded response.
- **Language:** API accepts Thai and English; responses match input language.

---

## 6. Environment Variables (required)

```
# AI
GEMINI_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Neo4j
NEO4J_URI=
NEO4J_USERNAME=
NEO4J_PASSWORD=

# Redis / Celery
REDIS_URL=

# App
NEXT_PUBLIC_API_BASE_URL=
```

---

## 7. Constraints & Guardrails

- **No cross-university data.** All program, PLO, and career data must be sourced from KU official documents only.
- **No unauthenticated writes.** All user data operations require a valid Supabase JWT.
- **Embedding dimension is fixed at 768.** Do not change the embedding model without migrating all vector columns.
- **Neo4j is read-only at runtime.** The SkillCluster graph is updated only via an offline admin pipeline, never by live API calls.
- **Gemini 2.5 Flash only.** Do not substitute other models in production without updating evaluation baselines.