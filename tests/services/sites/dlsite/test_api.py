import os

import pytest
from dotenv import load_dotenv

from app.services.dlsite_async import DlsiteAPI

load_dotenv()
proxy = os.getenv("PROXY", None)


class TestDlsiteAPI:
    @pytest.mark.asyncio
    async def test_get_work(self):
        async with DlsiteAPI(locale="zh_CN", proxy=proxy) as api:
            work = await api.get_work("VJ013965")
            assert work is not None
            assert work.product_id == "VJ013965"
            assert "多娜多娜" in work.work_name
            assert work.genre is None
            assert "わるいこ" in work.description

    @pytest.mark.asyncio
    async def test_get_jp_work(self):
        async with DlsiteAPI(locale="ja_JP", proxy=proxy) as api:
            work = await api.get_work("VJ013965")
            assert work is not None
            assert work.product_id == "VJ013965"
            assert "ドーナドーナ" in work.work_name
            assert "わるいこ" in work.description
            assert "売春/援交" in work.genre
