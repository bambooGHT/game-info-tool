from typing import Any, Dict, List

import httpx
from bs4 import BeautifulSoup
from loguru import logger
from pydantic import BaseModel, Field
from returns.result import Failure, Result, Success

from app.services.base import AsyncBaseCrawler


class TwoDFanModel(BaseModel):
    """2dfan数据模型"""

    name: str
    translateName: str = ""
    image: str = ""
    brand: str = ""
    releaseDate: str = ""
    platform: List[str] = Field(default_factory=list)
    gameTags: List[str] = Field(default_factory=list)
    pornTags: List[str] = Field(default_factory=list)
    sourceUrl: str
    introduction: str = ""


class TwoDFanCrawler(AsyncBaseCrawler[TwoDFanModel]):
    """2dfan网站爬虫实现"""

    def __init__(self, **kwargs):
        """初始化2dfan爬虫"""
        timeout = kwargs.get("timeout", 30)
        max_retries = kwargs.get("max_retries", 3)
        request_delay = kwargs.get("request_delay", (0.5, 2.0))

        super().__init__(
            base_url="https://2dfan.com",
            timeout=timeout,
            max_retries=max_retries,
            request_delay=request_delay,
        )

    async def search(self, query: str, **kwargs) -> Result[List[TwoDFanModel], str]:
        """搜索2dfan游戏

        Args:
            query: 搜索关键词
            **kwargs: 其他搜索参数，如page

        Returns:
            Result[List[TwoDFanModel], str]: 游戏信息列表
        """
        try:
            response = await self._get_search_html(query, **kwargs)

            match response:
                case Success(value):
                    search_results = await self.parse_search_results(value.text)
                    match search_results:
                        case Success(results):
                            # 只返回第一个
                            if results:
                                game_detail = await self.get_detail(results[0]["url"])
                                match game_detail:
                                    case Success(detail):
                                        return Success([detail])
                                    case Failure(exception):
                                        logger.error(
                                            f"Error getting detail from 2dfan: {exception}"
                                        )
                                        return Failure(exception)
                        case Failure(exception):
                            logger.error(f"Error parsing search results: {exception}")
                            return Failure(exception)
                case Failure(e):
                    logger.error(f"Error searching 2dfan: {e}")
                    return Failure(str(e))

            return Failure("未知错误")

        except Exception as e:
            logger.error(f"Error searching 2dfan: {e}")
            return Failure(str(e))

    async def get_detail(self, url: str, **kwargs) -> Result[TwoDFanModel, str]:
        """获取游戏详情

        Args:
            url: 详情页URL
            **kwargs: 其他参数

        Returns:
            Result[TwoDFanModel, str]: 游戏详细信息
        """
        try:
            response = await self._get_detail_html(url, **kwargs)

            match response:
                case Success(value):
                    game_data = await self.parse_detail_page(value.text, url)
                    match game_data:
                        case Success(data):
                            return Success(
                                TwoDFanModel(
                                    name=data.get("name", ""),
                                    translateName=data.get("translateName", ""),
                                    image=data.get("image", ""),
                                    brand=data.get("brand", ""),
                                    releaseDate=data.get("releaseDate", ""),
                                    platform=data.get("platform", []),
                                    gameTags=data.get("gameTags", []),
                                    pornTags=data.get("pornTags", []),
                                    sourceUrl=url or "",
                                    introduction=data.get("introduction", ""),
                                )
                            )
                        case Failure(e):
                            logger.error(f"Error parsing detail page: {e}")
                            return Failure(str(e))
                case Failure(e):
                    logger.error(f"Error getting detail from 2dfan: {e}")
                    return Failure(str(e))

            return Failure("未知错误")

        except Exception as e:
            logger.error(f"Error getting detail from 2dfan: {e}")
            return Failure(str(e))

    async def get_image(self, url: str, **kwargs) -> Result[httpx.Response, str]:
        """获取图片

        Args:
            url: 图片链接
            **kwargs: 其他参数
        """

        try:
            response = await self._get_image(url, **kwargs)

            match response:
                case Success(value):
                    return Success(value)
                case Failure(e):
                    logger.error(f"Error getting image from 2dfan: {e}")
                    return Failure(str(e))

            return Failure("未知错误")

        except Exception as e:
            logger.error(f"Error getting image from 2dfan: {e}")
            return Failure(str(e))

    async def _get_search_html(
        self, query: str, **kwargs
    ) -> Result[httpx.Response, Exception]:
        return await self._make_request(
            f"{self.base_url}/subjects/search?keyword={query}", method="GET"
        )

    async def _get_detail_html(
        self, url: str, **kwargs
    ) -> Result[httpx.Response, Exception]:
        return await self._make_request(url, method="GET")

    async def _get_image(self, url: str, **kwargs) -> Result[httpx.Response, Exception]:
        referer = "https://2dfan.com"
        return await self._make_request(url, method="GET", headers={"Referer": referer})

    async def parse_search_results(
        self, content: str
    ) -> Result[List[Dict[str, str]], str]:
        """解析搜索结果页面

        Args:
            content: 页面HTML内容

        Returns:
            Result[List[Dict[str, str]], str]: 解析后的搜索结果
        """
        results = []

        try:
            soup = BeautifulSoup(content, "html.parser")
            game_items = soup.select("#subjects li.media")

            for item in game_items:
                link_elem = item.select_one("h4.media-heading a")
                if not link_elem:
                    continue
                game_url = link_elem.get("href", "")
                game_name = link_elem.text.strip()
                results.append(
                    {
                        "name": game_name,
                        "url": f"{self.base_url}{game_url}",
                    }
                )

        except Exception as e:
            logger.error(f"Error parsing search results: {e}")
            return Failure(str(e))

        return Success(results)

    async def parse_detail_page(
        self, content: str, url: str
    ) -> Result[Dict[str, Any], str]:
        """解析详情页面

        Args:
            content: 页面HTML内容
            url: 页面URL

        Returns:
            Result[Dict[str, Any], str]: 解析后的详情数据
        """
        game_data = {
            "name": "",
            "translateName": "",
            "image": "",
            "brand": "",
            "releaseDate": "",
            "platform": [],
            "gameTags": [],
            "pornTags": [],
            "sourceUrl": url,
            "introduction": "",
        }

        try:
            soup = BeautifulSoup(content, "html.parser")

            # 游戏名称 - 从页面标题获取
            title_elem = soup.select_one("title")
            if title_elem:
                title_text = title_elem.text.strip()
                # 从标题中提取游戏名称，格式如："戦女神VERITA_战女神VERITA_2DFan"
                if "_" in title_text:
                    game_data["name"] = title_text.split("_")[0].strip()

            # 解析游戏信息标签
            tag_elements = soup.select("p.tags")

            for tag_elem in tag_elements:
                text = tag_elem.get_text()

                # 又名（中文名）
                if "又名：" in text:
                    translate_span = tag_elem.select_one("span.muted")
                    if translate_span:
                        game_data["translateName"] = translate_span.text.strip()

                # 品牌
                elif "品牌：" in text:
                    brand_link = tag_elem.select_one("a")
                    if brand_link:
                        game_data["brand"] = brand_link.text.strip()

                # 发售日期
                elif "发售日期：" in text:
                    # 提取日期，格式如："发售日期：2010-04-23"
                    date_text = (
                        text.replace("品牌：", "").replace("发售日期：", "").strip()
                    )
                    # 使用正则表达式提取日期
                    import re

                    date_match = re.search(r"\d{4}-\d{2}-\d{2}", date_text)
                    if date_match:
                        game_data["releaseDate"] = date_match.group()

            # 游戏标签 - 从侧边栏的常用标签区域获取
            tags_section = soup.select_one("#sidebar .block-content.tags")
            if tags_section:
                tag_links = tags_section.select("a.label.label-info")
                for link in tag_links:
                    tag_name = link.text.strip()
                    if tag_name:
                        game_data["gameTags"].append(tag_name)

            # 封面图 - 查找游戏封面
            image_elem = soup.select_one(
                "img[src*='subjects'], img[src*='uploads/subjects']"
            )
            if image_elem and "src" in image_elem.attrs:
                src = str(image_elem["src"])
                if src.startswith("//"):
                    src = "https:" + src
                elif src.startswith("/"):
                    src = "https://img.achost.top" + src
                game_data["image"] = src

            # 游戏介绍 - 从blockquote中获取
            blockquote = soup.select_one("blockquote")
            if blockquote:
                game_data["introduction"] = blockquote.get_text(
                    separator="\n",
                    strip=True,
                ).strip()

        except Exception as e:
            logger.error(f"Error parsing detail page: {e}")
            return Failure(str(e))

        return Success(game_data)


twodfan_client = TwoDFanCrawler()
