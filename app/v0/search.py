from datetime import datetime

from fastapi import APIRouter
from returns.result import Failure, Success

from app.services.sites.twodfan import twodfan_client

router = APIRouter()


@router.get("/search", summary="搜索游戏")
async def search(query: str):
    """搜索游戏

    Args:
        query: 搜索关键词

    Returns:
        dict: 搜索结果
    """
    async with twodfan_client:
        search_result = await twodfan_client.search(query)
        match search_result:
            case Success(data):
                data = [item.model_dump() for item in data]
                return {
                    "success": True,
                    "message": "ok",
                    "data": data,
                    "timestamp": datetime.now().isoformat(),
                }
            case Failure(exception):
                return {
                    "success": False,
                    "message": str(exception),
                    "data": [],
                    "timestamp": datetime.now().isoformat(),
                }
