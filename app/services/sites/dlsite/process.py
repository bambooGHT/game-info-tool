from httpx import Response
from returns.result import Failure, Result, Success

from app.services.models import ResponseModel
from app.services.sites.dlsite.detail import dlsite_detail_client
from app.services.sites.dlsite.search import dlsite_search_client


async def run(query: str) -> Result[list[ResponseModel], str]:
    results = []
    # search
    async with dlsite_search_client:
        match await dlsite_search_client.process(query=query):
            case Success(search_results):
                for search_result in search_results:
                    # detail
                    async with dlsite_detail_client:
                        match await dlsite_detail_client.process(
                            url=search_result.get("url", "")
                        ):
                            case Success(detail_result):
                                results.append(detail_result)
                            case Failure(e):
                                continue
            case Failure(e):
                return Failure(e)
    return Success(results)


async def get_search_html(query: str) -> Result[Response, str]:
    async with dlsite_search_client:
        match await dlsite_search_client._get(query):
            case Success(response):
                return Success(response)
            case Failure(e):
                return Failure(e)
    return Failure("Unknown Error")


async def get_detail_html(url: str) -> Result[Response, str]:
    async with dlsite_detail_client:
        match await dlsite_detail_client._get(url):
            case Success(response):
                return Success(response)
            case Failure(e):
                return Failure(e)
    return Failure("Unknown Error")


async def search(query: str) -> Result[list[dict[str, str]], str]:
    async with dlsite_search_client:
        match await dlsite_search_client.process(query):
            case Success(search_results):
                return Success(search_results)
            case Failure(e):
                return Failure(e)
    return Failure("Unknown Error")


async def detail(url: str) -> Result[ResponseModel, str]:
    async with dlsite_detail_client:
        match await dlsite_detail_client.process(url):
            case Success(game):
                return Success(game)
            case Failure(e):
                return Failure(e)
    return Failure("Unknown Error")


if __name__ == "__main__":
    import asyncio

    from loguru import logger

    # game = asyncio.run(
    #     run("美少女万华镜异闻")
    # )
    # logger.info(game)

    game = asyncio.run(
        detail("https://www.dlsite.com/pro/work/=/product_id/VJ01002448.html")
    )
    logger.info(game)
