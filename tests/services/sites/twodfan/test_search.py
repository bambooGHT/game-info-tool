from unittest.mock import MagicMock, patch

import pytest

from app.services.base import GameInfo
from app.services.sites.twodfan import TwoDFanCrawler


class TestTwoDFanSearch:
    """测试 TwoDFan 搜索功能"""

    @pytest.fixture
    def crawler(self):
        return TwoDFanCrawler()

    @pytest.fixture
    def mock_response(self):
        response = MagicMock()
        response.text = "<html>mock search results</html>"
        return response

    @pytest.mark.asyncio
    async def test_search_success(self, crawler, mock_response):
        """测试搜索成功"""
        mock_results = [
            {
                "name": "测试游戏",
                "translate_name": "Test Game",
                "url": "/game/123",
                "image": "/image/123.jpg",
            }
        ]

        with patch.object(crawler, "_make_request", return_value=mock_response):
            with patch.object(
                crawler, "parse_search_results", return_value=mock_results
            ):
                results = await crawler.search("测试关键词")

                assert len(results) == 1
                assert isinstance(results[0], GameInfo)
                assert results[0].name == "测试游戏"
                assert results[0].translate_name == "Test Game"

    @pytest.mark.asyncio
    async def test_search_with_pagination(self, crawler, mock_response):
        """测试带分页的搜索"""
        with patch.object(
            crawler, "_make_request", return_value=mock_response
        ) as mock_request:
            with patch.object(crawler, "parse_search_results", return_value=[]):
                await crawler.search("测试", page=2)

                mock_request.assert_called_once_with(
                    "https://2dfan.com/search",
                    method="GET",
                    params={"keyword": "测试", "page": 2},
                )

    @pytest.mark.asyncio
    async def test_search_exception_handling(self, crawler):
        """测试搜索异常处理"""
        with patch.object(crawler, "_make_request", side_effect=Exception("网络错误")):
            results = await crawler.search("测试")
            assert results == []
