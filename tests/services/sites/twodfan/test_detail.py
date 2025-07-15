from datetime import datetime
from unittest.mock import MagicMock, patch

import pytest

from app.services.base import GameInfo
from app.services.sites.twodfan import TwoDFanCrawler


class TestTwoDFanDetail:
    """测试 TwoDFan 详情获取功能"""

    @pytest.fixture
    def crawler(self):
        return TwoDFanCrawler()

    @pytest.fixture
    def mock_response(self):
        response = MagicMock()
        response.text = "<html>mock detail page</html>"
        return response

    @pytest.fixture
    def mock_game_data(self):
        return {
            "name": "测试游戏",
            "translateName": "Test Game",
            "image": "/image/test.jpg",
            "brand": "测试品牌",
            "releaseDate": "2023-12-25",
            "platform": ["PC", "Android"],
            "gameTags": ["RPG", "冒险"],
            "pornTags": ["tag1", "tag2"],
            "introduction": "这是一个测试游戏",
        }

    @pytest.mark.asyncio
    async def test_get_detail_success(self, crawler, mock_response, mock_game_data):
        """测试获取详情成功"""
        url = "https://2dfan.com/game/123"

        with patch.object(crawler, "_make_request", return_value=mock_response):
            with patch.object(
                crawler, "parse_detail_page", return_value=mock_game_data
            ):
                result = await crawler.get_detail(url)

                assert isinstance(result, GameInfo)
                assert result.name == "测试游戏"
                assert result.translate_name == "Test Game"
                assert result.brand == "测试品牌"
                assert result.release_date == datetime(2023, 12, 25)
                assert result.platform == ["PC", "Android"]
                assert result.source_url == url

    @pytest.mark.parametrize(
        "input_url,expected_url",
        [
            ("https://2dfan.com/game/123", "https://2dfan.com/game/123"),
            ("/game/123", "https://2dfan.com/game/123"),
            ("game/123", "https://2dfan.com/game/123"),
        ],
    )
    @pytest.mark.asyncio
    async def test_get_detail_url_normalization(self, crawler, input_url, expected_url):
        """测试 URL 标准化"""
        with patch.object(crawler, "_make_request") as mock_request:
            mock_request.return_value.text = "<html></html>"
            with patch.object(crawler, "parse_detail_page", return_value={}):
                await crawler.get_detail(input_url)
                mock_request.assert_called_once_with(expected_url, method="GET")

    @pytest.mark.asyncio
    async def test_get_detail_exception_handling(self, crawler):
        """测试获取详情异常处理"""
        url = "https://2dfan.com/game/123"

        with patch.object(crawler, "_make_request", side_effect=Exception("网络错误")):
            result = await crawler.get_detail(url)

            assert result.name == "Error"
            assert result.source_url == url
            assert "Error fetching data: 网络错误" in result.introduction
