import pytest
from returns.result import Failure, Success

from app.services.sites.twodfan import TwoDFanCrawler


class TestTwoDFanHtml:
    """测试 TwoDFan HTML 获取"""

    @pytest.fixture
    def crawler(self):
        """创建并初始化 crawler"""
        return TwoDFanCrawler()

    @pytest.mark.asyncio
    async def test_search_html(self, crawler: TwoDFanCrawler):
        """测试搜索 HTML 获取"""
        async with crawler:
            response = await crawler._get_search_html("戦女神VERITA")

            match response:
                case Success(value):
                    assert value.status_code == 200
                    assert "戦女神MEMORIA" in value.text

                    with open(
                        "tests/services/sites/twodfan/search.html",
                        "w",
                        encoding="utf-8",
                    ) as f:
                        f.write(value.text)
                case Failure(exception):
                    assert False, f"Failed to get search html: {exception}"

    @pytest.mark.asyncio
    async def test_detail_html(self, crawler: TwoDFanCrawler):
        """测试详情 HTML 获取"""
        async with crawler:
            response = await crawler._get_detail_html("https://2dfan.com/subjects/1006")

            match response:
                case Success(value):
                    assert value.status_code == 200
                    assert "幻燐の姫将軍" in value.text
                    with open(
                        "tests/services/sites/twodfan/detail.html",
                        "w",
                        encoding="utf-8",
                    ) as f:
                        f.write(value.text)
                case Failure(exception):
                    assert False, f"Failed to get detail html: {exception}"
