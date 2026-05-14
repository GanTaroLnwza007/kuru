import logging
import uuid
from collections.abc import Callable
from typing import Any

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from models.schemas import (
    ApiResponse,
    ChatRequest,
    ChatResponse,
    ChatSourceChunk,
    FeedbackRequest,
)

try:
    from kuru.ingestion.embedder import warm_up_model as _warm_up_model
    from kuru.rag.query_engine import query as _rag_query

    _RAG_AVAILABLE = True
except ImportError:
    _warm_up_model = None
    _rag_query = None
    _RAG_AVAILABLE = False

warm_up_model: Callable[[], None] | None = _warm_up_model
rag_query: Callable[..., Any] | None = _rag_query

router = APIRouter()
logger = logging.getLogger(__name__)

_RAG_READY = False
_RAG_WARMUP_ERROR: str | None = None


def warm_up_rag() -> None:
    """Load the local embedding model before the first chat request."""
    global _RAG_READY, _RAG_WARMUP_ERROR

    if not _RAG_AVAILABLE or warm_up_model is None:
        _RAG_READY = False
        _RAG_WARMUP_ERROR = "RAG pipeline package is not installed"
        return

    try:
        logger.info("Warming up KUru RAG embedding model")
        warm_up_model()
        _RAG_READY = True
        _RAG_WARMUP_ERROR = None
        logger.info("KUru RAG embedding model is ready")
    except Exception as exc:
        _RAG_READY = False
        _RAG_WARMUP_ERROR = f"{type(exc).__name__}: {exc}"
        logger.exception("KUru RAG warmup failed")


def get_rag_status() -> dict[str, bool | str | None]:
    return {
        "available": _RAG_AVAILABLE,
        "ready": _RAG_READY,
        "error": _RAG_WARMUP_ERROR,
    }


def _service_unavailable_response(session_id: str) -> ChatResponse:
    return ChatResponse(
        answer=(
            "ระบบกำลังโหลดโมเดลค้นหาข้อมูลครั้งแรกอยู่ครับ กรุณารอสักครู่แล้วลองถามใหม่อีกครั้ง "
            "/ KUru is warming up the local retrieval model. Please try again "
            "in a moment."
        ),
        session_id=session_id,
        confidence_level="low",
        sources=[],
        used_tcas_data=False,
    )


def _confidence_level(sources: list[dict]) -> str:
    if not sources:
        return "low"
    top = sources[0].get("similarity", 0.0)
    if top >= 0.5:
        return "high"
    if top >= 0.35:
        return "medium"
    return "low"


@router.post("/chat")
async def chat(request: ChatRequest) -> JSONResponse:
    session_id = request.session_id or str(uuid.uuid4())

    if not _RAG_AVAILABLE or rag_query is None:
        stub = _service_unavailable_response(session_id)
        return JSONResponse(content=ApiResponse[ChatResponse](data=stub).model_dump())

    if not _RAG_READY:
        warm_up_rag()
        if not _RAG_READY:
            stub = _service_unavailable_response(session_id)
            payload = ApiResponse[ChatResponse](data=stub).model_dump()
            return JSONResponse(content=payload)

    history = [
        {"role": t.role, "content": t.content}
        for t in request.conversation_history[-5:]
    ]

    try:
        result = rag_query(
            question=request.message,
            program_id=request.program_context_id,
            conversation_history=history,
        )
    except Exception:
        logger.exception("RAG chat query failed")
        stub = _service_unavailable_response(session_id)
        return JSONResponse(content=ApiResponse[ChatResponse](data=stub).model_dump())

    sources = [
        ChatSourceChunk(
            source_file=s.get("source_file", ""),
            section_type=s.get("section_type", ""),
            similarity=s.get("similarity", 0.0),
        )
        for s in result.sources
    ]

    response = ChatResponse(
        answer=result.answer,
        session_id=session_id,
        confidence_level=_confidence_level(result.sources),
        sources=sources,
        used_tcas_data=result.used_tcas_data,
    )

    payload = ApiResponse[ChatResponse](data=response).model_dump()
    return JSONResponse(content=payload)


@router.post("/chat/feedback")
async def chat_feedback(request: FeedbackRequest) -> JSONResponse:
    from supabase import create_client

    from core.config import settings

    sb = create_client(settings.supabase_url, settings.supabase_key)
    sb.table("feedback").insert({
        "session_id": request.session_id,
        "question": request.question,
        "answer": request.answer,
        "rating": request.rating,
    }).execute()

    return JSONResponse(content={"ok": True})
