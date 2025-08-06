import pytest
from returns.result import Failure, Success

from app.services.sites.dlsite import dlsite_detail
from app.services.sites.dlsite import dlsite_process


class TestDLSiteHtmlParse:
    """测试 DLSite HTML 解析"""

    @pytest.mark.asyncio
    async def test_detail_html_parse_0(self):
        """测试详情 HTML 解析"""
        result = await dlsite_detail(
            "https://www.dlsite.com/soft/work/=/product_id/VJ014408.html"
        )

        match result:
            case Success(value):
                assert value.name == "9-nine-"
                assert (
                    value.images[0]
                    == "https://img.dlsite.jp/modpub/images2/work/professional/VJ015000/VJ014408_img_main.jpg"
                )
                assert len(value.images) > 1
                assert value.brand == "ぱれっと"
                assert value.releaseDate == "2021-04-23"
                for item in [
                    "萌",
                    "妹妹",
                    "同学/同事",
                    "前辈/后辈",
                    "学校/学园",
                    "推理",
                ]:
                    assert item in value.categoryTags
                for item in ["ADV"]:
                    assert item in value.gameTags
                assert "日语" in value.langTags
                assert value.sourceUrl.endswith(
                    "/work/=/product_id/VJ014408.html"
                )
                assert "ぜひお聞きください！" in value.introduction
            case Failure(exception):
                assert False, f"Failed to get detail html: {exception}"

    @pytest.mark.asyncio
    async def test_detail_html_parse_1(self):
        """测试详情 HTML 解析"""
        response = await dlsite_process("隐秘露出 真菜香的禁忌快感")

        match response:
            case Success(value):
                if len(value) > 0:
                    value = value[0]
                    assert (
                        value.name
                        == "秘密のエクスポーズ バレないように露出するマナカさん"
                    )
                    assert (
                        value.translateName == "【多语言】隐秘露出 真菜香的禁忌快感"
                    )
                    assert (
                        value.images[0]
                        == "https://img.dlsite.jp/modpub/images2/work/doujin/RJ01390000/RJ01389782_img_main.jpg"
                    )
                    assert len(value.images) > 1
                    assert value.brand == "しーぶるそふと"
                    assert value.releaseDate == "2025-06-12"
                    for item in [
                        "女主人公",
                        "换装",
                        "3D作品",
                        "室外",
                        "露出",
                        "拘束",
                        "巨乳/爆乳",
                    ]:
                        assert item in value.categoryTags
                    for item in ["ACN"]:
                        assert item in value.gameTags
                    for item in [
                        "日语",
                        "英语",
                        "简体中文",
                        "繁体中文",
                        "韩语",
                    ]:
                        assert item in value.langTags
                    assert value.sourceUrl.endswith(
                        "/work/=/product_id/RJ01389782.html"
                    )
                    assert "一开始是在宁静的住宅区……" in value.introduction
            case Failure(exception):
                assert False, f"Failed to get detail html: {exception}"

    @pytest.mark.asyncio
    async def test_detail_html_parse_2(self):
        """测试详情 HTML 解析"""
        response = await dlsite_process("美少女万华镜异闻")

        match response:
            case Success(value):
                if len(value) > 0:
                    value = value[0]
                    assert value.name == "美少女万華鏡異聞 雪おんな"
                    assert value.translateName == "美少女万华镜异闻 雪女 官方中文版"
                    assert (
                        value.images[0]
                        == "https://img.dlsite.jp/modpub/images2/work/professional/VJ01003000/VJ01002448_img_main.jpg"
                    )
                    assert len(value.images) > 1
                    assert value.brand == "ωstar / Seikei Production"
                    assert value.releaseDate == "2024-06-28"
                    for item in [
                        "少女",
                        "妖怪",
                        "和服",
                        "超自然现象",
                        "推理",
                        "长发",
                        "巨乳/爆乳",
                    ]:
                        assert item in value.categoryTags
                    for item in ["ADV"]:
                        assert item in value.gameTags
                    for item in [
                        "日语",
                        "简体中文",
                    ]:
                        assert item in value.langTags
                    assert value.sourceUrl.endswith(
                        "/work/=/product_id/VJ01002448.html"
                    )
                    assert "那是爱河之愉悦（情欲）" in value.introduction
            case Failure(exception):
                assert False, f"Failed to get detail html: {exception}"
