from datetime import datetime

import pytest

from app.services.sites.twodfan import TwoDFanCrawler


class TestTwoDFanParse:
    """测试 TwoDFan 解析功能"""

    @pytest.fixture
    def crawler(self):
        return TwoDFanCrawler()

    @pytest.fixture
    def search_html(self):
        """模拟搜索结果页面 HTML"""
        return """
        <div class="game-item">
            <a href="/game/123">
                <img src="/image/123.jpg" alt="游戏图片">
                <div class="name">测试游戏1</div>
                <div class="translate-name">Test Game 1</div>
            </a>
        </div>
        <div class="game-item">
            <a href="/game/456">
                <div class="name">测试游戏2</div>
            </a>
        </div>
        """

    @pytest.mark.asyncio
    async def test_parse_search_results(self, crawler, search_html):
        """测试解析搜索结果"""
        results = await crawler.parse_search_results(search_html)

        assert len(results) == 2
        assert results[0]["name"] == "测试游戏1"
        assert results[0]["translate_name"] == "Test Game 1"
        assert results[0]["url"] == "/game/123"
        assert results[0]["image"] == "/image/123.jpg"

        assert results[1]["name"] == "测试游戏2"
        assert results[1]["translate_name"] is None

    @pytest.mark.parametrize(
        "date_str,expected",
        [
            ("2023-12-25", datetime(2023, 12, 25)),
            ("2024-01-01", datetime(2024, 1, 1)),
            ("invalid-date", None),
            ("", None),
            (None, None),
        ],
    )
    def test_parse_date(self, crawler, date_str, expected):
        """测试日期解析"""
        result = crawler._parse_date(date_str)
        assert result == expected
