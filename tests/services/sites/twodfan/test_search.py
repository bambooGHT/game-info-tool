import pytest
from returns.result import Failure, Success

from app.services.sites.twodfan import twodfan_search


class TestTwoDFanSearch:
    """测试 TwoDFan 搜索"""

    @pytest.mark.asyncio
    async def test_search(self):
        """测试搜索"""
        match await twodfan_search("戦女神VERITA"):
            case Success(value):
                assert len(value) == 2
                assert value[0]["name"] == "戦女神VERITA"
                assert value[0]["url"] == "https://2dfan.com/subjects/1006"
            case Failure(exception):
                assert False, f"Failed to parse search results: {exception}"
