import pytest
from returns.result import Failure, Success

from app.services.sites.twodfan import TwoDFanCrawler


class TestTwoDFanDetail:
    """测试 TwoDFan 详情"""

    @pytest.fixture
    def crawler(self):
        """创建并初始化 crawler"""
        return TwoDFanCrawler()

    @pytest.mark.asyncio
    async def test_detail(self, crawler: TwoDFanCrawler):
        """测试详情"""
        async with crawler:
            response = await crawler._get_detail_html("https://2dfan.com/subjects/1006")

            match response:
                case Success(value):
                    parse_result = await crawler.parse_detail_page(
                        value.text, "https://2dfan.com/subjects/1006"
                    )
                    match parse_result:
                        case Success(value):
                            assert value.name == "戦女神VERITA"
                            assert value.translateName == "战女神VERITA"
                            assert (
                                value.images[0]
                                == "https://img.achost.top/uploads/subjects/packages/normal_3feb4a95b1b3ec30d31a86226338b94d.jpg"
                            )
                            assert value.brand == "エウシュリー"
                            assert value.releaseDate == "2010-04-23"
                            assert value.platform == []
                            for item in [
                                "RPG",
                                "架空世界",
                                "魔法",
                                "冒险",
                                "战斗",
                                "汉化",
                            ]:
                                assert item in value.categoryTags
                            assert value.gameTags == []
                            assert value.sourceUrl == "https://2dfan.com/subjects/1006"
                            assert (
                                "因继承魔族之血的メンフィル王リウイ的胜利而终结了"
                                in value.introduction
                            )
                        case Failure(exception):
                            assert False, f"Failed to parse detail results: {exception}"
                case Failure(exception):
                    assert False, f"Failed to get detail html: {exception}"
