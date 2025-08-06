import httpx
from returns.result import Result

from app.services.base import AsyncBaseCrawler
from app.services.models import ResponseModel


class TwoDFanImage(AsyncBaseCrawler[ResponseModel]):
    def __init__(self, **kwargs):
        timeout = kwargs.get("timeout", 30)
        max_retries = kwargs.get("max_retries", 3)
        request_delay = kwargs.get("request_delay", (0.5, 1.0))

        super().__init__(
            base_url="https://2dfan.com",
            timeout=timeout,
            max_retries=max_retries,
            request_delay=request_delay,
        )

    async def _get(self, url: str, **kwargs) -> Result[httpx.Response, str]:
        referer = "https://2dfan.com"
        return await self._make_request(url, method="GET", headers={"Referer": referer})


twodfan_image_client = TwoDFanImage()
