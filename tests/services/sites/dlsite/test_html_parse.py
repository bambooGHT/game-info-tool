import pytest
from returns.result import Failure, Success

from app.services.sites.dlsite import DLSiteCrawler


class TestDLSiteHtmlParse:
    """测试 DLSite HTML 解析"""

    @pytest.fixture
    def crawler(self):
        """创建并初始化 crawler"""
        return DLSiteCrawler()

    @pytest.mark.asyncio
    async def test_search_html_parse(self, crawler: DLSiteCrawler):
        """测试搜索 HTML 解析"""
        async with crawler:
            response = await crawler._get_search_html("9-nine-")

            match response:
                case Success(value):
                    parse_result = await crawler.parse_search_results(value.text)
                    match parse_result:
                        case Success(value):
                            assert len(value) == 1
                            assert value[0]["name"] == "9-nine-"
                            assert (
                                value[0]["url"]
                                == "https://www.dlsite.com/home/work/=/product_id/VJ014408.html"
                            )
                        case Failure(exception):
                            assert False, f"Failed to parse search results: {exception}"
                case Failure(exception):
                    assert False, f"Failed to get search html: {exception}"

    @pytest.mark.asyncio
    async def test_detail_html_parse(self, crawler: DLSiteCrawler):
        """测试详情 HTML 解析"""
        async with crawler:
            response = await crawler._get_detail_html(
                "https://www.dlsite.com/home/work/=/product_id/VJ014408.html/?locale=zh_CN"
            )

            match response:
                case Success(value):
                    parse_result = await crawler.parse_detail_page(
                        value.text,
                        "https://www.dlsite.com/home/work/=/product_id/VJ014408.html",
                    )
                    match parse_result:
                        case Success(value):
                            assert value["name"] == "9-nine-"
                            assert (
                                value["image"]
                                == "https://img.dlsite.jp/modpub/images2/work/professional/VJ015000/VJ014408_img_main.jpg"
                            )
                            assert value["brand"] == "ぱれっと"
                            assert value["releaseDate"] == "2021-04-23"
                            for item in [
                                "萌え",
                                "妹",
                                "同級生/同僚",
                                "先輩/後輩",
                                "学校/学園",
                                "ミステリー",
                            ]:
                                assert item in value["gameTags"]
                            assert value["pornTags"] == []
                            assert value["langTags"] == ["日语"]
                            assert (
                                value["sourceUrl"]
                                == "https://www.dlsite.com/home/work/=/product_id/VJ014408.html"
                            )
                            assert "ぜひお聞きください！" in value["introduction"]
                        case Failure(exception):
                            assert False, f"Failed to parse detail results: {exception}"
                case Failure(exception):
                    assert False, f"Failed to get detail html: {exception}"
