import re
from typing import Any

import httpx
from bs4 import BeautifulSoup
from loguru import logger
from returns.result import Failure, Result, Success

from app.services.base import AsyncBaseCrawler
from app.services.models import ResponseModel


class DLsiteDetail(AsyncBaseCrawler[ResponseModel]):
    def __init__(self, **kwargs):
        timeout = kwargs.get("timeout", 30)
        max_retries = kwargs.get("max_retries", 3)
        request_delay = kwargs.get("request_delay", (0.5, 1.0))

        super().__init__(
            base_url="https://www.dlsite.com",
            timeout=timeout,
            max_retries=max_retries,
            request_delay=request_delay,
        )

    async def process(self, url: str) -> Result[ResponseModel, str]:
        match await self._get(url):
            case Success(response):
                cn_result = self._parse_cn(response.text)
                if jp_url := cn_result.get("jp_url", ""):
                    logger.info(f"jp_url found: {jp_url}")
                    match await self._get(jp_url, locale="ja_JP"):
                        case Success(jp_response):
                            jp_result = self._parse_jp(jp_response.text)
                        case Failure(_):
                            jp_result = {"name": ""}
                else:
                    match await self._get(url, locale="ja_JP"):
                        case Success(jp_response):
                            jp_result = self._parse_jp(jp_response.text)
                        case Failure(_):
                            jp_result = {"name": ""}
                return Success(
                    ResponseModel(
                        name=jp_result.get("name", ""),
                        translateName=cn_result.get("translate_name", ""),
                        brand=cn_result.get("brand", ""),
                        platform=[],
                        releaseDate=cn_result.get("release_date", ""),
                        categoryTags=cn_result.get("category_tags", []),
                        langTags=cn_result.get("language_tags", []),
                        images=cn_result.get("images", []),
                        gameTags=cn_result.get("game_tags", []),
                        sourceUrl=url,
                        introduction=cn_result.get("introduction", ""),
                    )
                )
            case Failure(e):
                return Failure(e)
        return Failure(f"Unkown Error GET {url}")

    async def _get(
        self, url: str, locale: str = "zh_CN"
    ) -> Result[httpx.Response, str]:
        headers = {"Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7"}
        if "locale" not in url:
            if url.endswith("/"):
                url = url[:-1]
            url += f"/?locale={locale}"
        return await self._make_request(
            url, method="GET", headers=headers, follow_redirects=True
        )

    def _parse_cn(self, content: str) -> dict[str, Any]:
        soup = BeautifulSoup(content, "html.parser")
        return {
            "jp_url": self._parse_jp_url(soup),
            "translate_name": self._parse_name(soup),
            "brand": self._parse_brand(soup),
            "release_date": self._parse_release_date(soup),
            "category_tags": self._parse_category_tags(soup),
            "language_tags": self._parse_language_tags(soup),
            "images": self._parse_images(soup),
            "game_tags": self._parse_game_tags(soup),
            "introduction": self._parse_introduction(soup),
        }

    def _parse_jp(self, content: str) -> dict[str, str]:
        soup = BeautifulSoup(content, "html.parser")
        return {"name": self._parse_name(soup)}

    def _parse_jp_url(self, soup) -> str:
        work_editions = soup.select("a.work_edition_linklist_item")
        logger.debug(f"work_editions: {work_editions}")
        if work_editions:
            for edition in work_editions:
                logger.debug(f"edition: {edition}")
                if edition.text.strip() == "日本語" or edition.text.strip() == "日文":
                    return edition.get("href", "")
        return ""

    def _parse_name(self, soup) -> str:
        title_elem = soup.select_one("h1#work_name")
        if title_elem:
            return title_elem.text.strip()
        return ""

    def _parse_brand(self, soup) -> str:
        brand_elem = soup.select_one("span.maker_name a")
        if brand_elem:
            return brand_elem.text.strip()
        return ""

    def _parse_release_date(self, soup) -> str:
        outline_table = soup.select_one("table#work_outline")
        if outline_table:
            rows = outline_table.select("tr")
            for row in rows:
                th = row.select_one("th")
                td = row.select_one("td")
                if th and td:
                    th_text = th.text.strip()
                    if "販売日" in th_text or "发售日" in th_text:
                        # 提取日期
                        date_match = re.search(r"\d{4}年\d{2}月\d{2}日", td.text)
                        if date_match:
                            date_str = date_match.group()
                            # 转换为标准格式
                            date_str = (
                                date_str.replace("年", "-")
                                .replace("月", "-")
                                .replace("日", "")
                            )
                            return date_str
        return ""

    def _parse_category_tags(self, soup) -> list[str]:
        category_tags = []
        genre_div = soup.select_one("div.main_genre")
        if genre_div:
            genre_links = genre_div.select("a")
            for link in genre_links:
                tag_name = link.text.strip()
                if tag_name:
                    category_tags.append(tag_name)
        return category_tags

    def _parse_language_tags(self, soup) -> list[str]:
        language_tags = []
        outline_table = soup.select_one("table#work_outline")
        if outline_table:
            rows = outline_table.select("tr")
            for row in rows:
                th = row.select_one("th")
                if th and "支持的语言" in th.text.strip():
                    lang_div = row.select_one("div.work_genre")
                    if lang_div:
                        lang_spans = lang_div.select("span[class*='icon_']")
                        for span in lang_spans:
                            class_list = span.get("class", [])
                            if "icon_JPN" in class_list:
                                language_tags.append("日语")
                            elif "icon_ENG" in class_list:
                                language_tags.append("英语")
                            elif "icon_CHI_HANS" in class_list:
                                language_tags.append("简体中文")
                            elif "icon_CHI_HANT" in class_list:
                                language_tags.append("繁体中文")
                            elif "icon_KO_KR" in class_list:
                                language_tags.append("韩语")
                            elif "icon_SPA" in class_list:
                                language_tags.append("西班牙语")
                            elif "icon_OTL" in class_list:
                                language_tags.append("其他语言")
                            elif "icon_NM" in class_list:
                                language_tags.append("无语言")
                    break
        language_map = {
            "日文": "日语",
            "简体中文（官方翻译）": "简体中文",
            "简体中文": "简体中文",
            "繁体中文（官方翻译）": "繁体中文",
            "繁体中文": "繁体中文",
            "英语（官方翻译）": "英语",
            "英文": "英语",
            "韩语（官方翻译）": "韩语",
            "韩文": "韩语",
            "西班牙语（官方翻译）": "西班牙语",
            "西班牙文": "西班牙语",
        }
        work_edition = soup.select_one("ul.work_edition")
        if work_edition:
            edition_items = work_edition.select("li")
            for item in edition_items:
                label = item.select_one("p.work_label")
                if label and "语言选择" in label.text.strip():
                    lang_links = item.select("a.work_edition_linklist_item")
                    for link in lang_links:
                        lang_text = link.text.strip()
                        if lang_text in language_map:
                            mapped_lang = language_map[lang_text]
                            if mapped_lang not in language_tags:
                                language_tags.append(mapped_lang)
                    break
        return language_tags

    def _parse_images(self, soup) -> list[str]:
        images = []
        slider_div = soup.select_one("div.product-slider-data")
        if slider_div:
            img_divs = slider_div.select("div[data-src]")
            for div in img_divs:
                src = div.get("data-src", "")
                if src:
                    if src.startswith("//"):
                        src = "https:" + src
                    images.append(src)
        return images

    def _parse_game_tags(self, soup) -> list[str]:
        game_tags = []
        work_genre_div = soup.select_one("div#category_type") or soup.select_one(
            "div.work_genre"
        )
        if work_genre_div:
            # span 标签中的第一项，例如 冒险，取它的 class 的值，例如 icon_ADV
            span = work_genre_div.select_one("span")
            if span:
                work_type = span.get("class", [])[0].replace("icon_", "")
                game_tags.append(work_type)
        return game_tags

    def _parse_introduction(self, soup) -> str:
        description_div = soup.select_one("div[itemprop='description']")
        if description_div:
            # 获取所有文本内容区域
            text_parts = description_div.select("div.work_parts_area")
            introduction_parts = []

            for part in text_parts:
                text_content = part.get_text(separator="\n", strip=True)
                if text_content:
                    introduction_parts.append(text_content)

            if introduction_parts:
                return "\n".join(introduction_parts)
        return ""


dlsite_detail_client = DLsiteDetail()
