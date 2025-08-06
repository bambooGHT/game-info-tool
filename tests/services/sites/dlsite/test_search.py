import pytest
from returns.result import Failure, Result, Success

from app.services.sites.dlsite import dlsite_search


class TestDLSiteHtmlParse:
    """测试 DLSite HTML 解析"""

    @pytest.mark.asyncio
    async def test_maniax_search(self):
        """测试搜索 HTML 解析"""
        result = await dlsite_search("少女騎士リーリエの姫様救出物語")
        match result:
            case Success(value):
                assert len(value) >= 1
                assert value[0]["name"] == "少女騎士リーリエの姫様救出物語"
                assert value[0]["url"].endswith("/work/=/product_id/RJ01345889.html")
            case Failure(_):
                assert False, "Failed to test_maniax_search"

    @pytest.mark.asyncio
    async def test_pro_search(self):
        """测试搜索 HTML 解析"""
        result = await dlsite_search("多娜多娜")
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
    async def test_appx_search(self):
        """测试搜索 HTML 解析"""
        result = await dlsite_search("【中英日】邂逅电车：始发站【APK版】")
        match result:
            case Success(value):
                assert len(value) >= 1
                assert value[0]["name"] == "【中英日】邂逅电车：始发站【APK版】"
                assert value[0]["url"].endswith("/work/=/product_id/RJ01304992.html")
            case Failure(_):
                assert False, "Failed to test_appx_search"

    @pytest.mark.asyncio
    async def test_home_search(self):
        """测试搜索 HTML 解析"""
        result = await dlsite_search("幻想少女大戦")
        match result:
            case Success(value):
                assert len(value) >= 1
                assert value[0]["name"] == "幻想少女大戦コンプリートボックス"
                assert value[0]["url"].endswith("/work/=/product_id/RJ268024.html")
            case Failure(_):
                assert False, "Failed to test_home_search"

    @pytest.mark.asyncio
    async def test_soft_search(self):
        """测试搜索 HTML 解析"""
        result = await dlsite_search("9-nine-")
        match result:
            case Success(value):
                assert len(value) >= 1
                assert value[0]["name"] == "9-nine-"
                assert value[0]["url"].endswith("/work/=/product_id/VJ014408.html")
            case Failure(_):
                assert False, "Failed to test_soft_search"

    @pytest.mark.asyncio
    async def test_app_search(self):
        """测试搜索 HTML 解析"""
        result = await dlsite_search("弹珠人勇者（apk版）")
        match result:
            case Success(value):
                assert len(value) >= 1
                assert value[0]["name"] == "弹珠人勇者（apk版）"
                assert value[0]["url"].endswith("/work/=/product_id/RJ284993.html")
            case Failure(_):
                assert False, "Failed to test_app_search"

    @pytest.mark.asyncio
    async def test_search_0(self):
        """测试搜索 HTML 解析"""
        result = await dlsite_search("隐秘露出 真菜香的禁忌快感")
        match result:
            case Success(value):
                assert len(value) >= 1
                assert value[0]["name"] == "【多语言】隐秘露出 真菜香的禁忌快感"
                assert value[0]["url"].endswith("/work/=/product_id/RJ01389782.html")
            case Failure(_):
                assert False, "Failed to test_search_0"
