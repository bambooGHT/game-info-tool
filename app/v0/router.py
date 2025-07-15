from fastapi import APIRouter

from app.v0.health import router as health_router
from app.v0.search import router as search_router

router = APIRouter()
router.include_router(health_router)
router.include_router(search_router, prefix="/v0")
