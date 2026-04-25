---
description: How to scaffold any new FastAPI endpoint in KUru following the KUruResponse envelope, JWT auth middleware, and error handling conventions. Use this skill whenever a task creates a new backend route.
---

# Skill: FastAPI endpoint scaffold

Every KUru endpoint follows the same structure. Copy this pattern — never invent your own.

## 1. The response models (already defined in backend/models/schemas.py)

```python
# backend/models/schemas.py — do not redefine these, import them
from pydantic import BaseModel
from typing import Any, Generic, TypeVar

T = TypeVar("T")

class SourceRef(BaseModel):
    table: str
    row_id: str
    program_name: str | None = None
    plo_code: str | None = None
    excerpt: str | None = None
    source_document: str | None = None
    round: str | None = None
    academic_year: str | None = None

class KUruResponse(BaseModel, Generic[T]):
    data: T | None = None
    sources: list[SourceRef] = []
    error: str | None = None
```

## 2. Auth dependency (already defined in backend/dependencies.py)

```python
# backend/dependencies.py — import this, never re-implement JWT validation
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client
from backend.config import settings

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Validates Supabase JWT and returns the user payload. Raises 401 if invalid."""
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    try:
        user = supabase.auth.get_user(credentials.credentials)
        return user.user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
```

## 3. Full endpoint example

```python
# backend/api/programs.py
from fastapi import APIRouter, Depends, Query
from backend.models.schemas import KUruResponse, SourceRef
from backend.dependencies import get_current_user
from backend.rag.retriever import search_programs

router = APIRouter(prefix="/api/v1/programs", tags=["programs"])


class ProgramSearchResult(BaseModel):
    id: str
    name_en: str
    name_th: str
    faculty_en: str
    similarity: float
    year_by_year_vibe: str | None


@router.get("/search", response_model=KUruResponse[list[ProgramSearchResult]])
async def search(
    q: str = Query(..., min_length=2, description="Search query in Thai or English"),
    current_user: dict = Depends(get_current_user)
) -> KUruResponse[list[ProgramSearchResult]]:
    """
    Semantic search over KU programs using pgvector cosine similarity.
    Returns top-5 results above the 0.72 threshold.
    """
    try:
        chunks = await search_programs(q)

        if not chunks:
            return KUruResponse(
                data=[],
                sources=[],
                error=None
            )

        results = [ProgramSearchResult(**chunk) for chunk in chunks]
        sources = [
            SourceRef(table="programs", row_id=chunk["id"], program_name=chunk["name_en"])
            for chunk in chunks
        ]

        return KUruResponse(data=results, sources=sources)

    except Exception as e:
        # Never let unhandled exceptions leak implementation details
        return KUruResponse(data=None, error="An error occurred. Please try again.")
```

## 4. Register the router in main.py

```python
# backend/main.py
from backend.api.programs import router as programs_router
app.include_router(programs_router)
```

## Rules — never violate

- Every endpoint must use `response_model=KUruResponse[YourType]`. Never return a bare dict.
- Every endpoint that writes user data must have `Depends(get_current_user)`. Read-only search endpoints may be public.
- Every endpoint that calls Gemini must return a non-empty `sources[]` or return the fallback error instead.
- Catch all exceptions at the endpoint level — never let stack traces reach the frontend.
- Never put business logic directly in the router function — delegate to service modules (`rag/`, `riasec/`, etc.).