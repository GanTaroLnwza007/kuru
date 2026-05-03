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
    id: str = Field(description="Unique program identifier (e.g. 'ske')")
    name_th: str = Field(description="Program name in Thai")
    name_en: str = Field(description="Program name in English")
    faculty_th: str = Field(description="Faculty name in Thai")
    faculty_en: str = Field(description="Faculty name in English")
    degree: str = Field(description="Degree type (e.g. ปริญญาตรี)")
    campus: str = Field(description="Campus name")
    match_score: float = Field(description="Relevance score (0–1)", ge=0.0, le=1.0)
    year_by_year_vibe: str = Field(description="1–2 sentence Thai summary of the program experience")


class ProgramSearchResult(BaseModel):
    results: list[ProgramSummary] = Field(description="Matching programs")
    total: int = Field(description="Total number of results")


class PloItem(BaseModel):
    code: str = Field(description="PLO code (e.g. PLO1)")
    description_th: str = Field(description="PLO description in Thai")


class TcasRound(BaseModel):
    round: str = Field(description="TCAS round name")
    quota: int = Field(description="Number of seats")
    min_score: float | None = Field(default=None, description="Minimum score if applicable")


class ProgramDetail(ProgramSummary):
    plos: list[PloItem] = Field(description="Program Learning Outcomes")
    tcas_rounds: list[TcasRound] = Field(description="TCAS admission rounds")


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


class ChatResponse(BaseModel):
    answer: str = Field(description="Assistant's grounded answer")
    session_id: str = Field(description="Session ID for follow-up messages")
