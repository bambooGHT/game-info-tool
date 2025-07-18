from typing import Any, Dict, List

import httpx
from bs4 import BeautifulSoup
from loguru import logger
from pydantic import BaseModel, Field
from returns.result import Failure, Result, Success

from app.services.base import AsyncBaseCrawler


class DLSiteModel(BaseModel):
    """dlsite数据模型"""

    name: str
    translateName: str = ""
    image: str = ""
    brand: str = ""
    releaseDate: str = ""
    platform: List[str] = Field(default_factory=list)
    gameTags: List[str] = Field(default_factory=list)
    pornTags: List[str] = Field(default_factory=list)
    langTags: List[str] = Field(default_factory=list)
    sourceUrl: str
    introduction: str = ""


class DLSiteCrawler(AsyncBaseCrawler[DLSiteModel]):
    """dlsite网站爬虫实现"""

    def __init__(self, **kwargs):
        """初始化dlsite爬虫"""
        timeout = kwargs.get("timeout", 30)
        max_retries = kwargs.get("max_retries", 3)
        request_delay = kwargs.get("request_delay", (0.5, 2.0))

        super().__init__(
            base_url="https://dlsite.com",
            timeout=timeout,
            max_retries=max_retries,
            request_delay=request_delay,
        )

    async def search(self, query: str, **kwargs) -> Result[List[DLSiteModel], str]:
        """搜索dlsite游戏

        Args:
            query: 搜索关键词
            **kwargs: 其他搜索参数，如page

        Returns:
            Result[List[DLSiteModel], str]: 游戏信息列表
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
                                            f"Error getting detail from dlsite: {exception}"
                                        )
                                        return Failure(exception)
                        case Failure(exception):
                            logger.error(f"Error parsing search results: {exception}")
                            return Failure(exception)
                case Failure(e):
                    logger.error(f"Error searching dlsite: {e}")
                    return Failure(str(e))

            return Failure("未知错误")

        except Exception as e:
            logger.error(f"Error searching dlsite: {e}")
            return Failure(str(e))

    async def get_detail(self, url: str, **kwargs) -> Result[DLSiteModel, str]:
        """获取游戏详情

        Args:
            url: 详情页URL
            **kwargs: 其他参数

        Returns:
            Result[DLSiteModel, str]: 游戏详细信息
        """
        try:
            response = await self._get_detail_html(url, **kwargs)

            match response:
                case Success(value):
                    game_data = await self.parse_detail_page(value.text, url)
                    match game_data:
                        case Success(data):
                            return Success(
                                DLSiteModel(
                                    name=data.get("name", ""),
                                    translateName=data.get("translateName", ""),
                                    image=data.get("image", ""),
                                    brand=data.get("brand", ""),
                                    releaseDate=data.get("releaseDate", ""),
                                    platform=data.get("platform", []),
                                    gameTags=data.get("gameTags", []),
                                    pornTags=data.get("pornTags", []),
                                    language=data.get("langTags", []),
                                    sourceUrl=url or "",
                                    introduction=data.get("introduction", ""),
                                )
                            )
                        case Failure(e):
                            logger.error(f"Error parsing detail page: {e}")
                            return Failure(str(e))
                case Failure(e):
                    logger.error(f"Error getting detail from dlsite: {e}")
                    return Failure(str(e))

            return Failure("未知错误")

        except Exception as e:
            logger.error(f"Error getting detail from dlsite: {e}")
            return Failure(str(e))

    async def _get_search_html(
        self, query: str, **kwargs
    ) -> Result[httpx.Response, Exception]:
        return await self._make_request(
            f"{self.base_url}/home/fsr/=/keyword/{query}/order/trend/work_type_category[0]/game/options[0]/JPN/options[1]/NM",
            method="GET",
        )

    async def _get_detail_html(
        self, url: str, **kwargs
    ) -> Result[httpx.Response, Exception]:
        headers = {"Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7"}
        return await self._make_request(url, method="GET", headers=headers)

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
            game_items = soup.select("dd.work_name")

            for item in game_items:
                link_elem = item.select_one("a")
                if not link_elem:
                    continue
                game_url = link_elem.get("href", "")
                game_name = link_elem.text.strip()
                results.append(
                    {
                        "name": game_name,
                        "url": game_url,
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
            "langTags": [],
            "sourceUrl": url,
            "introduction": "",
        }

        try:
            soup = BeautifulSoup(content, "html.parser")

            # 游戏名称
            title_elem = soup.select_one("h1#work_name")
            if title_elem:
                game_data["name"] = title_elem.text.strip()

            # 品牌名
            brand_elem = soup.select_one("span.maker_name a")
            if brand_elem:
                game_data["brand"] = brand_elem.text.strip()

            # 发售日期
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
                            import re

                            date_match = re.search(r"\d{4}年\d{2}月\d{2}日", td.text)
                            if date_match:
                                date_str = date_match.group()
                                # 转换为标准格式
                                date_str = (
                                    date_str.replace("年", "-")
                                    .replace("月", "-")
                                    .replace("日", "")
                                )
                                game_data["releaseDate"] = date_str

            # 游戏标签 - 从分类中获取
            genre_div = soup.select_one("div.main_genre")
            if genre_div:
                genre_links = genre_div.select("a")
                for link in genre_links:
                    tag_name = link.text.strip()
                    if tag_name:
                        game_data["gameTags"].append(tag_name)

            # 语言标签 - 从作品形式行中获取
            outline_table = soup.select_one("table#work_outline")
            if outline_table:
                rows = outline_table.select("tr")
                for row in rows:
                    th = row.select_one("th")
                    if th and "作品形式" in th.text.strip():
                        lang_div = row.select_one("div.work_genre")
                        if lang_div:
                            lang_spans = lang_div.select("span[class*='icon_']")
                            for span in lang_spans:
                                class_list = span.get("class", [])
                                if "icon_JPN" in class_list:
                                    game_data["langTags"].append("日语")
                                elif "icon_ENG" in class_list:
                                    game_data["langTags"].append("英语")
                                elif "icon_CHI_HANS" in class_list:
                                    game_data["langTags"].append("简体中文")
                                elif "icon_CHI_HANT" in class_list:
                                    game_data["langTags"].append("繁体中文")
                        break

            # 封面图 - 从产品滑块中获取主图
            main_img = soup.select_one("img[itemprop='image']")
            if main_img and "srcset" in main_img.attrs:
                src = main_img["srcset"]
                if src.startswith("//"):
                    src = "https:" + src
                game_data["image"] = src

            # 游戏介绍 - 从作品内容区域获取
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
                    game_data["introduction"] = "\n".join(introduction_parts)

        except Exception as e:
            logger.error(f"Error parsing detail page: {e}")
            return Failure(str(e))

        return Success(game_data)


dlsite_client = DLSiteCrawler()
