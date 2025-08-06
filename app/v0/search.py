from datetime import datetime
from typing import Generic, TypeVar

from fastapi import APIRouter
from pydantic import BaseModel
from returns.result import Failure, Success

from app.services.models import ResponseModel
from app.services.sites.dlsite import dlsite_process
from app.services.sites.twodfan import twodfan_process

router = APIRouter()


T = TypeVar("T")


class SearchResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: list[T]
    timestamp: str

    @classmethod
    def ok(cls, data: list[T]) -> "SearchResponse[T]":
        return cls(
            success=True, message="ok", data=data, timestamp=datetime.now().isoformat()
        )

    @classmethod
    def failure(cls, message: str) -> "SearchResponse[T]":
        return cls(
            success=False,
            message=message,
            data=[],
            timestamp=datetime.now().isoformat(),
        )


@router.get("/search", summary="搜索游戏")
async def search(query: str, site: str = "2dfan") -> SearchResponse[ResponseModel]:
    """搜索游戏

    Args:
        query: 搜索关键词

    Returns:
        dict: 搜索结果
    """
    match site:
        case "2dfan":
            search_result = await twodfan_process(query)
            match search_result:
                case Success(data):
                    data = [item for item in data]
                    return SearchResponse.ok(data)
                case Failure(exception):
                    return SearchResponse.failure(str(exception))
        case "dlsite":
            search_result = await dlsite_process(query)
            match search_result:
                case Success(data):
                    data = [item for item in data]
                    return SearchResponse.ok(data)
                case Failure(e):
                    return SearchResponse.failure(e)
        case _:
            return SearchResponse.failure("不支持的站点")

    return SearchResponse.failure("不支持的站点")
