from fastapi import APIRouter

from api.v1 import chat, programs

router = APIRouter()
router.include_router(programs.router, prefix="/programs", tags=["programs"])
router.include_router(chat.router, prefix="", tags=["chat"])
