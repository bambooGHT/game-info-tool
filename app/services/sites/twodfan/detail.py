import re

import httpx
from bs4 import BeautifulSoup
from loguru import logger
from returns.result import Failure, Result, Success

from app.services.base import AsyncBaseCrawler
from app.services.models import ResponseModel


class TwoDFanDetail(AsyncBaseCrawler[ResponseModel]):
    def __init__(self, **kwargs):
        timeout = kwargs.get("timeout", 30)
        max_retries = kwargs.get("max_retries", 3)
        request_delay = kwargs.get("request_delay", (0.5, 1.0))

        super().__init__(
            base_url="https://2dfan.com",
            timeout=timeout,
            max_retries=max_retries,
            request_delay=request_delay,
        )

    async def process(self, url) -> Result[ResponseModel, str]:
        match await self._get(url):
            case Success(response):
                return await self._parse(response.text, url)
            case Failure(e):
                return Failure(e)
        return Failure(f"Unknown Error Detail {url}")

    async def _get(self, url: str, **kwargs) -> Result[httpx.Response, str]:
        return await self._make_request(url, method="GET")

    async def _parse(self, content: str, url: str) -> Result[ResponseModel, str]:
        game_data = ResponseModel()
        game_data.sourceUrl = url

        try:
            soup = BeautifulSoup(content, "html.parser")
            game_data.name = self._parse_name(soup)
            game_data.translateName, game_data.brand, game_data.releaseDate = (
                self._parse_game_info(soup)
            )
            game_data.categoryTags = self._parse_category_tags(soup)
            game_data.images = self._parse_images(soup)
            game_data.introduction = self._parse_introduction(soup)

        except Exception as e:
            logger.error(f"Error parsing detail page: {e}")
            return Failure(str(e))

        return Success(game_data)

    def _parse_name(self, soup) -> str:
        title_elem = soup.select_one("title")
        if title_elem:
            title_text = title_elem.text.strip()
            if "_" in title_text:
                return title_text.split("_")[0].strip()
        return ""

    def _parse_game_info(self, soup) -> tuple[str, str, str]:
        translate_name, brand, release_date = "", "", ""
        tag_elements = soup.select("p.tags")

        for tag_elem in tag_elements:
            text = tag_elem.get_text()

            if "又名：" in text:
                translate_span = tag_elem.select_one("span.muted")
                if translate_span:
                    translate_name = translate_span.text.strip()

            elif "品牌：" in text:
                brand_link = tag_elem.select_one("a")
                if brand_link:
                    brand = brand_link.text.strip()

            elif "发售日期：" in text:
                # 提取日期，格式如："发售日期：2010-04-23"
                date_text = text.replace("品牌：", "").replace("发售日期：", "").strip()
                date_match = re.search(r"\d{4}-\d{2}-\d{2}", date_text)
                if date_match:
                    release_date = date_match.group()
        return translate_name, brand, release_date

    def _parse_category_tags(self, soup) -> list[str]:
        tags = []
        tags_section = soup.select_one("#sidebar .block-content.tags")
        if tags_section:
            tag_links = tags_section.select("a.label.label-info")
            for link in tag_links:
                tag_name = link.text.strip()
                if tag_name:
                    tags.append(tag_name)
        return tags

    def _parse_images(self, soup) -> list[str]:
        images = []
        image_elem = soup.select_one(
            "img[src*='subjects'], img[src*='uploads/subjects']"
        )
        if image_elem and "src" in image_elem.attrs:
            src = str(image_elem["src"])
            if src.startswith("//"):
                src = "https:" + src
            elif src.startswith("/"):
                src = "https://img.achost.top" + src
            images.append(src)
        return images

    def _parse_introduction(self, soup) -> str:
        blockquote = soup.select_one("blockquote")
        if blockquote:
            return blockquote.get_text(
                separator="\n",
                strip=True,
            ).strip()
        return ""


twodfan_detail_client = TwoDFanDetail()
