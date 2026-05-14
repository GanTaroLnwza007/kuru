from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware

from api.v1 import chat as chat_routes
from api.v1.router import router
from core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    await run_in_threadpool(chat_routes.warm_up_rag)
    yield


app = FastAPI(
    title="KUru API",
    description="KU Program Navigator - RAG chatbot and Program Explorer",
    version="0.1.0",
    lifespan=lifespan,
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
async def health() -> dict[str, object]:
    return {"status": "ok", "rag": chat_routes.get_rag_status()}
