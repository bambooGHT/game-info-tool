from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from returns.result import Failure, Success

from app.services.sites.twodfan import twodfan_image

router = APIRouter()


@router.get("/image", summary="获取图片")
async def image(url: str) -> StreamingResponse:
    """获取图片

    Args:
        url: 图片链接

    Returns:
        StreamingResponse: 图片流
    """
    if url.startswith("https://img.achost.top"):
        image_result = await twodfan_image(url)
        match image_result:
            case Success(data):
                return StreamingResponse(
                    data.iter_bytes(),
                    media_type=data.headers.get("content-type", "image/jpeg"),
                    headers={"Cache-Control": "public, max-age=3600"},
                )
            case Failure(exception):
                return StreamingResponse(status_code=500, content=str(exception))

    return StreamingResponse(status_code=500, content="未知的图片域名地址")
