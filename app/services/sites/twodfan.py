from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx
from bs4 import BeautifulSoup
from loguru import logger
from returns.result import Failure, Result, Success

from app.services.base import AsyncBaseCrawler, GameInfo


class TwoDFanCrawler(AsyncBaseCrawler[GameInfo]):
    """2dfan网站爬虫实现"""

    def __init__(self, **kwargs):
        """初始化2dfan爬虫"""
        timeout = kwargs.get("timeout", 30)
        max_retries = kwargs.get("max_retries", 3)
        request_delay = kwargs.get("request_delay", (0.5, 2.0))
        respect_robots_txt = kwargs.get("respect_robots_txt", True)

        super().__init__(
            base_url="https://2dfan.com",
            timeout=timeout,
            max_retries=max_retries,
            request_delay=request_delay,
            respect_robots_txt=respect_robots_txt,
        )

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

    async def search(self, query: str, **kwargs) -> List[GameInfo]:
        """搜索2dfan游戏

        Args:
            query: 搜索关键词
            **kwargs: 其他搜索参数，如page

        Returns:
            List[GameInfo]: 游戏信息列表
        """
        page = kwargs.get("page", 1)
        search_url = f"{self.base_url}/search"

        try:
            response = await self._make_request(
                search_url, method="GET", params={"keyword": query, "page": page}
            )

            match response:
                case Success(value):
                    raw_results = await self.parse_search_results(value.text)
                case Failure(exception):
                    logger.error(f"Error searching 2dfan: {exception}")
                    return []

            # 转换为GameInfo对象
            results = []
            for item in raw_results:
                # 只获取基本信息，详细信息需要通过get_detail获取
                game_info = GameInfo(
                    name=item.get("name", ""),
                    translate_name=item.get("translate_name"),
                    source_url=item.get("url", ""),
                    image=item.get("image"),
                )
                results.append(game_info)

            return results

        except Exception as e:
            logger.error(f"Error searching 2dfan: {e}")
            return []

    async def get_detail(self, url: str, **kwargs) -> GameInfo:
        """获取游戏详情

        Args:
            url: 详情页URL
            **kwargs: 其他参数

        Returns:
            GameInfo: 游戏详细信息
        """
        try:
            # 如果传入的是相对URL，则拼接完整URL
            if not url.startswith("http"):
                url = f"{self.base_url}{url}"

            response = await self._make_request(url, method="GET")

            match response:
                case Success(value):
                    game_data = await self.parse_detail_page(value.text, url)
                case Failure(exception):
                    logger.error(f"Error getting detail from 2dfan: {exception}")
                    return GameInfo(
                        name="Error",
                        source_url=url,
                        introduction=f"Error fetching data: {str(exception)}",
                    )

            # 转换为GameInfo对象
            return GameInfo(
                name=game_data.get("name", ""),
                translate_name=game_data.get("translateName"),
                image=game_data.get("image"),
                brand=game_data.get("brand"),
                release_date=self._parse_date(game_data.get("releaseDate")),
                platform=game_data.get("platform", []),
                game_tags=game_data.get("gameTags", []),
                porn_tags=game_data.get("pornTags", []),
                source_url=url,
                introduction=game_data.get("introduction"),
            )

        except Exception as e:
            logger.error(f"Error getting detail from 2dfan: {e}")
            # 返回一个最小化的GameInfo对象，包含错误信息
            return GameInfo(
                name="Error",
                source_url=url,
                introduction=f"Error fetching data: {str(e)}",
            )

    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        """解析日期字符串为datetime对象"""
        if not date_str:
            return None

        try:
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            logger.warning(f"Failed to parse date: {date_str}")
            return None

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
            "translateName": None,
            "image": None,
            "brand": None,
            "releaseDate": None,
            "platform": [],
            "gameTags": [],
            "pornTags": [],
            "sourceUrl": url,
            "introduction": None,
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
                src = image_elem["src"]
                if src.startswith("//"):
                    src = "https:" + src
                elif src.startswith("/"):
                    src = "https://img.achost.top" + src
                game_data["image"] = src

            # 游戏介绍 - 从blockquote中获取
            intro_elem = soup.select_one("blockquote p")
            if intro_elem:
                # 获取所有p标签的文本内容
                intro_paragraphs = soup.select("blockquote p")
                intro_texts = []
                for p in intro_paragraphs:
                    text = p.get_text().strip()
                    if text and len(text) > 10:  # 过滤掉太短的文本
                        intro_texts.append(text)

                if intro_texts:
                    game_data["introduction"] = "\n".join(intro_texts)

        except Exception as e:
            logger.error(f"Error parsing detail page: {e}")
            return Failure(str(e))

        return Success(game_data)
