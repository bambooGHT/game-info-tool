import pytest
from returns.result import Failure, Success

from app.services.sites.dlsite import dlsite_get_detail_html


class TestDLSiteDetailHtml:
    """测试 DLSite HTML 获取"""

    @pytest.mark.asyncio
    async def test_detail_html_0(self):
        """测试详情 HTML 获取"""
        response = await dlsite_get_detail_html(
            "https://www.dlsite.com/maniax/work/=/product_id/RJ01389782.html"
        )

        match response:
            case Success(value):
                assert value.status_code == 200
                assert "隐秘露出 真菜香的禁忌快感" in value.text
                with open(
                    "tests/services/sites/dlsite/detail_RJ01389782.html",
                    "w",
                    encoding="utf-8",
                ) as f:
                    f.write(value.text)
            case Failure(exception):
                assert False, f"Failed to get detail html: {exception}"

    @pytest.mark.asyncio
    async def test_detail_html_1(self):
        """测试详情 HTML 获取"""
        response = await dlsite_get_detail_html(
            "https://www.dlsite.com/maniax/work/=/product_id/VJ01002448.html"
        )

        match response:
            case Success(value):
                assert value.status_code == 200
                assert "美少女万华镜异闻 雪女 官方中文版" in value.text
                with open(
                    "tests/services/sites/dlsite/detail_VJ01002448.html",
                    "w",
                    encoding="utf-8",
                ) as f:
                    f.write(value.text)
            case Failure(exception):
                assert False, f"Failed to get detail html: {exception}"



