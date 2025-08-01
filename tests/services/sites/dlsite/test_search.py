import pytest
from returns.result import Failure, Result, Success

from app.services.sites.dlsite import DLSiteCrawler


class TestDLSiteHtmlParse:
    """测试 DLSite HTML 解析"""

    @pytest.fixture
    def crawler(self):
        """创建并初始化 crawler"""
        return DLSiteCrawler()

    async def _search(
        self, crawler: DLSiteCrawler, query: str
    ) -> Result[list[dict[str, str]], None]:
        """测试搜索"""
        async with crawler:
            wrapped_safe_html = await crawler._get_search_html(query, False)
            match wrapped_safe_html:
                case Failure(_):
                    return Failure(None)
                case Success(safe_html):
                    wrapped_safe_parse_result = await crawler.parse_search_results(
                        safe_html.text
                    )
                    match wrapped_safe_parse_result:
                        case Failure(_):
                            return Failure(None)
                        case Success(safe_parse_result):
                            if len(safe_parse_result) == 0:
                                wrapped_r18_safe_html = await crawler._get_search_html(
                                    query, True
                                )
                                match wrapped_r18_safe_html:
                                    case Failure(_):
                                        return Failure(None)
                                    case Success(r18_safe_html):
                                        wrapped_r18_safe_parse_result = (
                                            await crawler.parse_search_results(
                                                r18_safe_html.text
                                            )
                                        )
                                        match wrapped_r18_safe_parse_result:
                                            case Failure(_):
                                                return Failure(None)
                                            case Success(r18_safe_parse_result):
                                                if len(r18_safe_parse_result) == 0:
                                                    return Failure(None)
                                                else:
                                                    return Success(
                                                        r18_safe_parse_result
                                                    )
                            else:
                                return Success(safe_parse_result)
        return Failure(None)

    @pytest.mark.asyncio
    async def test_maniax_search(self, crawler: DLSiteCrawler):
        """测试搜索 HTML 解析"""
        result = await self._search(crawler, "少女騎士リーリエの姫様救出物語")
        match result:
            case Success(value):
                assert len(value) >= 1
                assert value[0]["name"] == "少女騎士リーリエの姫様救出物語"
                assert value[0]["url"].endswith("/work/=/product_id/RJ01345889.html")
            case Failure(_):
                assert False, "Failed to test_maniax_search"

    @pytest.mark.asyncio
    async def test_pro_search(self, crawler: DLSiteCrawler):
        """测试搜索 HTML 解析"""
        result = await self._search(crawler, "多娜多娜")
        match result:
            case Success(value):
                assert len(value) >= 1
                assert (
                    value[0]["name"]
                    == "多娜多娜 一起干坏事吧 / 【中文簡体版】ドーナドーナ いっしょにわるいことをしよう"
                )
                assert value[0]["url"].endswith("/work/=/product_id/VJ014316.html")
            case Failure(_):
                assert False, "Failed to test_pro_search"

    @pytest.mark.asyncio
    async def test_appx_search(self, crawler: DLSiteCrawler):
        """测试搜索 HTML 解析"""
        result = await self._search(crawler, "【中英日】邂逅电车：始发站【APK版】")
        match result:
            case Success(value):
                assert len(value) >= 1
                assert value[0]["name"] == "【中英日】邂逅电车：始发站【APK版】"
                assert value[0]["url"].endswith("/work/=/product_id/RJ01304992.html")
            case Failure(_):
                assert False, "Failed to test_appx_search"

    @pytest.mark.asyncio
    async def test_home_search(self, crawler: DLSiteCrawler):
        """测试搜索 HTML 解析"""
        result = await self._search(crawler, "幻想少女大戦")
        match result:
            case Success(value):
                assert len(value) >= 1
                assert value[0]["name"] == "幻想少女大戦コンプリートボックス"
                assert value[0]["url"].endswith("/work/=/product_id/RJ268024.html")
            case Failure(_):
                assert False, "Failed to test_home_search"

    @pytest.mark.asyncio
    async def test_soft_search(self, crawler: DLSiteCrawler):
        """测试搜索 HTML 解析"""
        result = await self._search(crawler, "9-nine-")
        match result:
            case Success(value):
                assert len(value) >= 1
                assert value[0]["name"] == "9-nine-"
                assert value[0]["url"].endswith("/work/=/product_id/VJ014408.html")
            case Failure(_):
                assert False, "Failed to test_soft_search"

    @pytest.mark.asyncio
    async def test_app_search(self, crawler: DLSiteCrawler):
        """测试搜索 HTML 解析"""
        result = await self._search(crawler, "弹珠人勇者（apk版）")
        match result:
            case Success(value):
                assert len(value) >= 1
                assert value[0]["name"] == "弹珠人勇者（apk版）"
                assert value[0]["url"].endswith("/work/=/product_id/RJ284993.html")
            case Failure(_):
                assert False, "Failed to test_app_search"
