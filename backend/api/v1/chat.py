import uuid

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from kuru.rag.query_engine import query as rag_query
from models.schemas import (
    ApiResponse,
    ChatRequest,
    ChatResponse,
    ChatSourceChunk,
    FeedbackRequest,
)

router = APIRouter()


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

    history = [{"role": t.role, "content": t.content} for t in request.conversation_history[-5:]]

    result = rag_query(
        question=request.message,
        program_id=request.program_context_id,
        conversation_history=history,
    )

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
    from core.config import settings
    from supabase import create_client

    sb = create_client(settings.supabase_url, settings.supabase_key)
    sb.table("feedback").insert({
        "session_id": request.session_id,
        "question": request.question,
        "answer": request.answer,
        "rating": request.rating,
    }).execute()

    return JSONResponse(content={"ok": True})
