---
description: How to implement a pgvector semantic similarity search function in KUru's FastAPI backend. Use this skill whenever a task requires querying plos, programs, careers, or tcas_requirements by embedding similarity.
---

# Skill: pgvector semantic search

Use this pattern every time you need to query KUru's Supabase tables by semantic similarity.

## The standard pattern

### 1. Embed the query

```python
# backend/rag/retriever.py
import google.generativeai as genai
from backend.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

def embed_query(text: str) -> list[float]:
    """Embed a user query using gemini-embedding-001. Returns a 768-dim vector."""
    result = genai.embed_content(
        model="models/gemini-embedding-001",
        content=text,
        task_type="retrieval_query"  # use retrieval_query for search, retrieval_document for indexing
    )
    return result["embedding"]
```

### 2. Call the Supabase RPC function

```python
from supabase import create_client
from backend.config import settings

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

def search_plos(query_text: str, match_count: int = 5) -> list[dict]:
    """
    Search plos table by cosine similarity.
    Returns only results above the 0.72 threshold defined in rag-guardrails.md §5.
    """
    embedding = embed_query(query_text)
    
    result = supabase.rpc(
        "search_plos",
        {
            "query_embedding": embedding,
            "match_threshold": 0.72,   # hard minimum — see rag-guardrails.md §5
            "match_count": match_count
        }
    ).execute()
    
    return result.data  # list of {id, description_en, similarity, ...}
```

### 3. The SQL function (already in migrations — do not re-create)

```sql
-- This lives in supabase/migrations/..._search_functions.sql
-- DO NOT write this in Python — it must be a Supabase RPC function
CREATE OR REPLACE FUNCTION search_plos(
    query_embedding vector(768),
    match_threshold float,
    match_count int
)
RETURNS TABLE(id uuid, description_en text, program_id uuid, plo_code text, similarity float)
LANGUAGE sql STABLE AS $$
    SELECT id, description_en, program_id, plo_code,
           1 - (embedding <=> query_embedding) AS similarity
    FROM plos
    WHERE embedding IS NOT NULL
      AND 1 - (embedding <=> query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
$$;
```

Equivalent functions exist for `programs`, `careers`, and `tcas_requirements`. Same pattern, different table and return columns.

## Multi-table search (for general chatbot queries)

```python
async def retrieve_context(query: str, match_count: int = 5) -> list[dict]:
    """
    Search all 4 RAG tables and merge results, ranked by similarity.
    Used for general chatbot questions that may touch any topic.
    """
    embedding = embed_query(query)
    
    tables = ["search_plos", "search_programs", "search_tcas", "search_portfolio_criteria"]
    all_chunks = []
    
    for rpc_fn in tables:
        result = supabase.rpc(rpc_fn, {
            "query_embedding": embedding,
            "match_threshold": 0.72,
            "match_count": match_count
        }).execute()
        all_chunks.extend(result.data)
    
    # Deduplicate and re-rank by similarity
    seen_ids = set()
    unique_chunks = []
    for chunk in sorted(all_chunks, key=lambda x: x["similarity"], reverse=True):
        if chunk["id"] not in seen_ids:
            seen_ids.add(chunk["id"])
            unique_chunks.append(chunk)
    
    return unique_chunks[:match_count]
```

## Confidence detection

```python
def get_retrieval_confidence(chunks: list[dict]) -> str:
    """
    Returns 'none', 'low', or 'high' based on top similarity score.
    Used to select the correct fallback policy from rag-guardrails.md §6.
    """
    if not chunks:
        return "none"
    top_score = chunks[0]["similarity"]
    if top_score < 0.78:
        return "low"
    return "high"
```

## Rules — never violate

- Always use `match_threshold: 0.72` — never lower it without updating rag-guardrails.md and the eval baseline.
- Always use `task_type="retrieval_query"` for user queries and `task_type="retrieval_document"` when embedding rows during ingestion.
- Never embed and search in the same request without checking `embedding IS NOT NULL` — the SQL function handles this, but don't bypass it.
- Never return more than `match_count=5` chunks to the LLM — larger context degrades faithfulness.