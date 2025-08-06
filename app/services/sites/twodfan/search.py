from typing import Dict, List

import httpx
from bs4 import BeautifulSoup
from loguru import logger
from returns.result import Failure, Result, Success

from app.services.base import AsyncBaseCrawler
from app.services.models import ResponseModel


class TwoDFanSearch(AsyncBaseCrawler[ResponseModel]):
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

    async def process(self, query: str) -> Result[list[dict[str, str]], str]:
        match await self._get(query):
            case Success(response):
                return await self._parse(response.text)
            case Failure(e):
                return Failure(e)
        return Failure(f"Unkown Error Search {query}")

    async def _get(
        self, query: str, **kwargs
    ) -> Result[httpx.Response, str]:
        return await self._make_request(
            f"{self.base_url}/subjects/search?keyword={query}", method="GET"
        )

    async def _parse(
        self, content: str
    ) -> Result[List[Dict[str, str]], str]:
        results = []

        try:
            soup = BeautifulSoup(content, "html.parser")
            game_items = soup.select("#subjects li.media")

            for item in game_items:
                link_elem = item.select_one("h4.media-heading a")
                if not link_elem:
                    continue
                game_url = link_elem.get("href", "")
                game_name = link_elem.text.strip()
                results.append(
                    {
                        "name": game_name,
                        "url": f"{self.base_url}{game_url}",
                    }
                )

        except Exception as e:
            logger.error(f"Error parsing search results: {e}")
            return Failure(str(e))

        return Success(results)


twodfan_search_client = TwoDFanSearch()
