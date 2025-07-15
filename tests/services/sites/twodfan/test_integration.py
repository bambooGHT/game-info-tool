from unittest.mock import MagicMock, patch

import pytest

from app.services.sites.twodfan import TwoDFanCrawler


class TestTwoDFanIntegration:
    """TwoDFan 集成测试"""

    @pytest.fixture
    def crawler(self):
        return TwoDFanCrawler()

    @pytest.mark.asyncio
    async def test_search_to_detail_workflow(self, crawler):
        """测试从搜索到获取详情的完整流程"""
        # 模拟搜索响应
        search_response = MagicMock()
        search_response.text = "<html>search results</html>"

        # 模拟详情响应
        detail_response = MagicMock()
        detail_response.text = "<html>detail page</html>"

        # 模拟搜索结果
        mock_search_results = [{"name": "测试游戏", "url": "/game/123"}]

        # 模拟详情数据
        mock_detail_data = {
            "name": "测试游戏",
            "translateName": "Test Game",
            "introduction": "游戏介绍",
        }

        with patch.object(crawler, "_make_request") as mock_request:
            mock_request.side_effect = [search_response, detail_response]

            with patch.object(
                crawler, "parse_search_results", return_value=mock_search_results
            ):
                with patch.object(
                    crawler, "parse_detail_page", return_value=mock_detail_data
                ):
                    # 执行搜索
                    search_results = await crawler.search("测试")
                    assert len(search_results) == 1

                    # 获取详情
                    detail = await crawler.get_detail(search_results[0].source_url)
                    assert detail.name == "测试游戏"
                    assert detail.translate_name == "Test Game"
