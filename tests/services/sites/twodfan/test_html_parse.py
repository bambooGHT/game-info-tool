import pytest
from returns.result import Failure, Success

from app.services.sites.twodfan import TwoDFanCrawler


class TestTwoDFanHtmlParse:
    """测试 TwoDFan HTML 解析"""

    @pytest.fixture
    def crawler(self):
        """创建并初始化 crawler"""
        return TwoDFanCrawler()

    @pytest.mark.asyncio
    async def test_search_html_parse(self, crawler: TwoDFanCrawler):
        """测试搜索 HTML 解析"""
        async with crawler:
            response = await crawler._get_search_html("戦女神VERITA")

            match response:
                case Success(value):
                    parse_result = await crawler.parse_search_results(value.text)
                    match parse_result:
                        case Success(value):
                            assert len(value) == 2
                            assert value[0]["name"] == "戦女神VERITA"
                            assert value[0]["url"] == "https://2dfan.com/subjects/1006"
                        case Failure(exception):
                            assert False, f"Failed to parse search results: {exception}"
                case Failure(exception):
                    assert False, f"Failed to get search html: {exception}"

    @pytest.mark.asyncio
    async def test_detail_html_parse(self, crawler: TwoDFanCrawler):
        """测试详情 HTML 解析"""
        pass
        # async with crawler:
        #     response = await crawler._get_detail_html("https://2dfan.com/subjects/1006")

        #     match response:
        #         case Success(value):
        #             pass
        #         case Failure(exception):
        #             assert False, f"Failed to get detail html: {exception}"
