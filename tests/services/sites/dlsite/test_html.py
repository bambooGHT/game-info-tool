import pytest
from returns.result import Failure, Success

from app.services.sites.dlsite import DLSiteCrawler


class TestDLSiteHtml:
    """测试 DLSite HTML 获取"""

    @pytest.fixture
    def crawler(self):
        """创建并初始化 crawler"""
        return DLSiteCrawler()

    @pytest.mark.asyncio
    async def test_search_html(self, crawler: DLSiteCrawler):
        """测试搜索 HTML 获取"""
        async with crawler:
            response = await crawler._get_search_html("9-nine-")

            match response:
                case Success(value):
                    assert value.status_code == 200
                    assert "9-nine-" in value.text

                    with open(
                        "tests/services/sites/dlsite/search.html",
                        "w",
                        encoding="utf-8",
                    ) as f:
                        f.write(value.text)
                case Failure(exception):
                    assert False, f"Failed to get search html: {exception}"

    @pytest.mark.asyncio
    async def test_detail_html(self, crawler: DLSiteCrawler):
        """测试详情 HTML 获取"""
        async with crawler:
            response = await crawler._get_detail_html(
                "https://www.dlsite.com/soft/work/=/product_id/VJ014408.html"
            )

            match response:
                case Success(value):
                    assert value.status_code == 200
                    assert "9-nine-" in value.text
                    with open(
                        "tests/services/sites/dlsite/detail.html",
                        "w",
                        encoding="utf-8",
                    ) as f:
                        f.write(value.text)
                case Failure(exception):
                    assert False, f"Failed to get detail html: {exception}"
