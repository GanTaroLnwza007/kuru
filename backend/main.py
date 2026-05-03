from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.v1.router import router
from core.config import settings

app = FastAPI(
    title="KUru API",
    description="KU Program Navigator — RAG chatbot and Program Explorer",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/api/v1/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}
