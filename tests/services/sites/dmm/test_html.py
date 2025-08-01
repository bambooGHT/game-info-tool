import pytest
from returns.result import Failure, Success

from app.services.sites.dmm import DMMCrawler


class TestDMMHtml:
    """测试 TwoDFan HTML 获取"""

    @pytest.fixture
    def crawler(self):
        """创建并初始化 crawler"""
        return DMMCrawler()

    @pytest.mark.asyncio
    async def test_search_html(self, crawler: DMMCrawler):
        """测试搜索 HTML 获取"""
        async with crawler:
            response = await crawler._get_search_html("ぬきたし")

            match response:
                case Success(value):
                    assert value.status_code == 200
                    assert "ぬきたし" in value.text

                    with open(
                        "tests/services/sites/dmm/search.html",
                        "w",
                        encoding="utf-8",
                    ) as f:
                        f.write(value.text)
                case Failure(exception):
                    assert False, f"Failed to get search html: {exception}"

    @pytest.mark.asyncio
    async def test_detail_html(self, crawler: DMMCrawler):
        """测试详情 HTML 获取"""
        async with crawler:
            response = await crawler._get_detail_html(
                "https://dlsoft.dmm.co.jp/detail/qruppo_0006/"
            )

            match response:
                case Success(value):
                    assert value.status_code == 200
                    assert "ぬきたし" in value.text
                    with open(
                        "tests/services/sites/dmm/detail.html",
                        "w",
                        encoding="utf-8",
                    ) as f:
                        f.write(value.text)
                case Failure(exception):
                    assert False, f"Failed to get detail html: {exception}"
