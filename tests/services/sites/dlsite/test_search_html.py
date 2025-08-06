import pytest
from returns.result import Failure, Success

from app.services.sites.dlsite import dlsite_get_search_html


class TestDLSiteSearchHtml:
    """测试 DLSite HTML 获取"""

    @pytest.mark.asyncio
    async def test_search_html_0(self):
        """测试搜索 HTML 获取"""
        response = await dlsite_get_search_html("秘密のエクスポーズ")

        match response:
            case Success(value):
                assert value.status_code == 200
                assert "秘密のエクスポーズ" in value.text

                with open(
                    "tests/services/sites/dlsite/search_秘密のエクスポーズ.html",
                    "w",
                    encoding="utf-8",
                ) as f:
                    f.write(value.text)
            case Failure(exception):
                assert False, f"Failed to get search html: {exception}"

    @pytest.mark.asyncio
    async def test_search_html_1(self):
        """测试搜索 HTML 获取"""
        response = await dlsite_get_search_html("多娜多娜")

        match response:
            case Success(value):
                assert value.status_code == 200
                assert "多娜多娜" in value.text

                with open(
                    "tests/services/sites/dlsite/search_多娜多娜.html",
                    "w",
                    encoding="utf-8",
                ) as f:
                    f.write(value.text)
            case Failure(exception):
                assert False, f"Failed to get search html: {exception}"
