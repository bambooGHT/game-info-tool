import httpx
from app.services.models import ResponseModel
from returns.result import Failure, Result, Success

from app.services.sites.twodfan.search import twodfan_search_client
from app.services.sites.twodfan.detail import twodfan_detail_client
from app.services.sites.twodfan.image import twodfan_image_client


async def run(query: str) -> Result[list[ResponseModel], str]:
    results = []
    # search
    async with twodfan_search_client:
        match await twodfan_search_client.process(query):
            case Success(search_results):
                for search_result in search_results:
                    # detail
                    async with twodfan_detail_client:
                        match await twodfan_detail_client.process(
                            search_result.get("url", "")
                        ):
                            case Success(game):
                                results.append(game)
                            case Failure(e):
                                continue
            case Failure(e):
                return Failure(e)
    return Success(results)


async def image(url: str) -> Result[httpx.Response, str]:
    async with twodfan_image_client:
        return await twodfan_image_client._get(url)


async def search_html(query: str) -> Result[httpx.Response, str]:
    async with twodfan_search_client:
        match await twodfan_search_client._get(query):
            case Success(response):
                return Success(response)
            case Failure(e):
                return Failure(e)
    return Failure("Unknown Error")


async def detail_html(url: str) -> Result[httpx.Response, str]:
    async with twodfan_detail_client:
        match await twodfan_detail_client._get(url):
            case Success(response):
                return Success(response)
            case Failure(e):
                return Failure(e)
    return Failure("Unknown Error")


async def search(query: str) -> Result[list[dict[str, str]], str]:
    async with twodfan_search_client:
        match await twodfan_search_client.process(query):
            case Success(search_results):
                return Success(search_results)
            case Failure(e):
                return Failure(e)
    return Failure("Unknown Error")


async def detail(url: str) -> Result[ResponseModel, str]:
    async with twodfan_detail_client:
        match await twodfan_detail_client.process(url):
            case Success(game):
                return Success(game)
            case Failure(e):
                return Failure(e)
    return Failure("Unknown Error")
