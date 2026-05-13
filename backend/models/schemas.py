from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class SourceChunk(BaseModel):
    table: str = Field(description="Supabase table the chunk came from")
    row_id: str = Field(description="Primary key of the source row")
    excerpt: str = Field(description="Short excerpt from the source document")


class ApiResponse(BaseModel, Generic[T]):
    data: T = Field(description="Response payload")
    sources: list[SourceChunk] = Field(
        default_factory=list,
        description="Source citations grounding the response",
    )
    error: str | None = Field(default=None, description="Error message if any")


class ProgramSummary(BaseModel):
    id: str = Field(description="Hash-based primary key (e.g. 'bangkhen_ddf705a9')")
    slug: str = Field(description="URL-friendly identifier (e.g. 'computer-eng')")
    name_th: str = Field(description="Program name in Thai")
    name_en: str = Field(description="Program name in English")
    faculty_th: str = Field(description="Faculty name in Thai")
    faculty_en: str = Field(description="Faculty name in English")
    degree: str = Field(description="Degree type (e.g. ปริญญาตรี)")
    campus: str = Field(description="Campus name")
    match_score: float = Field(description="Relevance score (0–1)", ge=0.0, le=1.0)
    year_by_year_vibe: str = Field(description="Thai summary of year-by-year program experience")


class ProgramSearchResult(BaseModel):
    results: list[ProgramSummary] = Field(description="Matching programs")
    total: int = Field(description="Total number of results")


class PloItem(BaseModel):
    code: str = Field(description="PLO code (e.g. PLO1)")
    description_th: str = Field(description="PLO description in Thai")


class TcasRound(BaseModel):
    round: str = Field(description="TCAS round name")
    track_name: str | None = Field(default=None, description="Admission track / project name extracted from source file")
    quota: int = Field(description="Number of seats")
    min_score: float | None = Field(default=None, description="Minimum score if applicable")
    exam_criteria: dict | None = Field(default=None, description="Exam subjects with weights or grade requirements")
    portfolio_requirements: dict | None = Field(default=None, description="Portfolio and prerequisite requirements")
    deadlines: dict | None = Field(default=None, description="Key dates in the admission timeline")


class ProgramDetail(ProgramSummary):
    plos: list[PloItem] = Field(description="Program Learning Outcomes")
    tcas_rounds: list[TcasRound] = Field(description="TCAS admission rounds")


class ConversationTurn(BaseModel):
    role: str = Field(description="'user' or 'assistant'")
    content: str = Field(description="Message content")


class ChatSourceChunk(BaseModel):
    source_file: str = Field(description="Source filename")
    section_type: str = Field(description="Section type (e.g. 'tcas', 'overview')")
    similarity: float = Field(description="Cosine similarity score (0–1)")


class ChatRequest(BaseModel):
    message: str = Field(description="User's message")
    program_context_id: str | None = Field(
        default=None,
        description="Program ID to pre-seed context (from 'Chat about this program')",
    )
    session_id: str | None = Field(
        default=None,
        description="Session ID for multi-turn continuity",
    )
    conversation_history: list[ConversationTurn] = Field(
        default_factory=list,
        description="Last N turns of conversation for multi-turn context (max 5)",
    )


class ChatResponse(BaseModel):
    answer: str = Field(description="Assistant's grounded answer")
    session_id: str = Field(description="Session ID for follow-up messages")
    confidence_level: str = Field(description="'high', 'medium', or 'low'")
    sources: list[ChatSourceChunk] = Field(default_factory=list, description="Source chunks used")
    used_tcas_data: bool = Field(default=False, description="Whether TCAS structured data was used")


class FeedbackRequest(BaseModel):
    session_id: str = Field(description="Session ID the answer belongs to")
    question: str = Field(description="The question that was asked")
    answer: str = Field(description="The answer that was given")
    rating: int = Field(description="1 = helpful, -1 = not helpful")
