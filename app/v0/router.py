from fastapi import APIRouter

from app.v0.health import router as health_router

router = APIRouter()
router.include_router(health_router)
