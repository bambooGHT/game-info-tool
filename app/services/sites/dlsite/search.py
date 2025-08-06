import httpx
from bs4 import BeautifulSoup
from loguru import logger
from returns.result import Failure, Result, Success

from app.services.base import AsyncBaseCrawler
from app.services.models import ResponseModel


class DLsiteSearch(AsyncBaseCrawler[ResponseModel]):
    def __init__(self, **kwargs):
        timeout = kwargs.get("timeout", 30)
        max_retries = kwargs.get("max_retries", 3)
        request_delay = kwargs.get("request_delay", (0.5, 1.0))

        super().__init__(
            base_url="https://www.dlsite.com",
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
        return Failure(f"Unknown Error Search: {query}")

    async def _get(
        self, query: str, is_r18: bool = False, **kwargs
    ) -> Result[httpx.Response, str]:
        keyword = f"keyword/{query.replace(' ', '+')}/"
        age_category = (
            "age_category[0]/general/"  # noqa: E501
            "age_category[1]/r15/"  # noqa: E501
            "age_category[2]/adult/"  # noqa: E501
        )
        work_category = (
            "work_category[0]/doujin/"
            "work_category[1]/pc/"
            "work_category[2]/app/"
            "work_category[3]/ai/"
        )
        order = "order/trend/"
        work_type_category = "work_type_category[0]/game/"
        options = (
            "options_and_or/and/"
            "options[0]/JPN/"
            "options[1]/ENG/"
            "options[2]/CHI_HANS/"
            "options[3]/CHI_HANT/"
            "options[4]/KO_KR/"
            "options[5]/SPA/"
            "options[6]/OTL/"
            "options[7]/NM/"
        )
        locale = "from/fsr.more/?locale=zh_CN"
        return await self._make_request(
            f"{self.base_url}/maniax/fsr/=/{keyword}{age_category}{work_category}{order}{work_type_category}{options}{locale}",
            method="GET",
        )

    async def _parse(
        self, content: str
    ) -> Result[list[dict[str, str]], str]:
        results = []

        try:
            soup = BeautifulSoup(content, "html.parser")
            game_items = soup.select("dd.work_name")

            for item in game_items:
                link_elem = item.select_one("a")
                if not link_elem:
                    continue
                game_url = link_elem.get("href", "")
                game_name = link_elem.text.strip()
                results.append(
                    {
                        "name": game_name,
                        "url": game_url,
                    }
                )

        except Exception as e:
            logger.error(f"Error parsing search results: {e}")
            return Failure(f"Error parsing search results: {e}")

        return Success(results)


dlsite_search_client = DLsiteSearch()
