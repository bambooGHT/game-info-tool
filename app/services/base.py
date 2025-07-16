from __future__ import annotations

import abc
import asyncio
import random
from typing import Any, Generic, List, Optional, TypeVar

import httpx
from loguru import logger
from returns.result import Failure, Result, Success

from app.configs import config

# 定义泛型类型变量，用于不同爬虫的不同数据模型
T = TypeVar("T")


class AsyncBaseCrawler(Generic[T], abc.ABC):
    """异步爬虫抽象基类"""

    def __init__(
        self,
        base_url: str,
        timeout: int = 30,
        max_retries: int = 3,
        request_delay: tuple[float, float] = (0.5, 1.0),
        respect_robots_txt: bool = False,
        user_agents: Optional[List[str]] = None,
    ):
        """初始化爬虫基类

        Args:
            base_url: 网站基础URL
            timeout: 请求超时时间（秒）
            max_retries: 最大重试次数
            request_delay: 请求间隔时间范围（最小值，最大值）
            respect_robots_txt: 是否遵守robots.txt规则
            user_agents: 自定义User-Agent列表
        """
        self.base_url = base_url
        self.timeout = timeout
        self.max_retries = max_retries
        self.request_delay = request_delay
        self.respect_robots_txt = respect_robots_txt

        # 默认User-Agent列表
        self.user_agents = user_agents or [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0",
        ]
        self.headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        }

        # 初始化HTTP客户端
        self.client = None
        self._robots_parser = None

    async def __aenter__(self) -> AsyncBaseCrawler[T]:
        """异步上下文管理器入口"""

        client_kwargs = {
            "timeout": self.timeout,
            "follow_redirects": True,
            "headers": {"User-Agent": random.choice(self.user_agents), **self.headers},
        }

        if config.proxy:
            client_kwargs["proxy"] = config.proxy

        self.client = httpx.AsyncClient(**client_kwargs)

        # 如果需要遵守robots.txt，则初始化解析器
        if self.respect_robots_txt:
            await self._init_robots_parser()

        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """异步上下文管理器退出"""
        if self.client:
            await self.client.aclose()

    async def _init_robots_parser(self):
        """初始化robots.txt解析器"""
        try:
            robots_url = f"{self.base_url}/robots.txt"
            response = await self._make_request(robots_url, method="GET")
            match response:
                case Success(value):
                    self._robots_parser = value.text
                    logger.debug(f"Loaded robots.txt from {robots_url}")
                case Failure(exception):
                    logger.warning(
                        f"Failed to load robots.txt from {robots_url}: {exception}"
                    )
        except Exception as e:
            logger.error(f"Error loading robots.txt: {e}")

    def _can_fetch(self, url: str) -> bool:
        """检查是否允许爬取指定URL"""
        if not self.respect_robots_txt or not self._robots_parser:
            return True

        # 简单实现，实际使用可以集成robotparser
        disallowed_paths = []
        current_agent = None

        for line in self._robots_parser.splitlines():
            if line.startswith("User-agent:"):
                agent = line.split(":", 1)[1].strip()
                if agent == "*" or any(ua in agent for ua in self.user_agents):
                    current_agent = agent
                else:
                    current_agent = None
            elif current_agent and line.startswith("Disallow:"):
                path = line.split(":", 1)[1].strip()
                if path:
                    disallowed_paths.append(path)

        for path in disallowed_paths:
            if url.endswith(path) or path in url:
                return False

        return True

    async def _make_request(
        self, url: str, method: str = "GET", **kwargs
    ) -> Result[httpx.Response, Exception]:
        """发送HTTP请求，包含重试和延迟机制

        Args:
            url: 请求URL
            method: HTTP方法
            **kwargs: 传递给httpx的其他参数

        Returns:
            httpx.Response: HTTP响应对象

        Raises:
            httpx.HTTPError: HTTP请求错误
        """
        if not self.client:
            return Failure(
                RuntimeError("HTTP client not initialized. Use async with context.")
            )

        if not self._can_fetch(url):
            return Failure(PermissionError(f"Robots.txt disallows access to {url}"))

        # 随机延迟请求
        delay = random.uniform(*self.request_delay)
        await asyncio.sleep(delay)

        # 更新User-Agent
        headers = kwargs.get("headers", {})
        headers["User-Agent"] = random.choice(self.user_agents)
        kwargs["headers"] = headers

        # 重试机制
        for attempt in range(self.max_retries + 1):
            try:
                if method.upper() == "GET":
                    response = await self.client.get(url, **kwargs)
                elif method.upper() == "POST":
                    response = await self.client.post(url, **kwargs)
                else:
                    raise ValueError(f"Unsupported HTTP method: {method}")

                response.raise_for_status()
                return Success(response)

            except httpx.HTTPError as e:
                if attempt == self.max_retries:
                    logger.error(f"Failed after {self.max_retries} attempts: {e}")
                    return Failure(e)

                # 指数退避重试
                wait_time = (2**attempt) + random.uniform(0, 1)
                logger.warning(f"Request failed, retrying in {wait_time:.2f}s: {e}")
                await asyncio.sleep(wait_time)

        return Failure(httpx.HTTPError(f"Failed to make request to {url}"))

    @abc.abstractmethod
    async def _get_search_html(
        self, query: str, **kwargs
    ) -> Result[httpx.Response, Exception]:
        pass

    @abc.abstractmethod
    async def _get_detail_html(
        self, url: str, **kwargs
    ) -> Result[httpx.Response, Exception]:
        pass

    @abc.abstractmethod
    async def search(self, query: str, **kwargs) -> Result[List[T], str]:
        """搜索页面爬取方法

        Args:
            query: 搜索关键词
            **kwargs: 其他搜索参数

        Returns:
            Result[List[T], str]: 搜索结果列表
        """
        pass

    @abc.abstractmethod
    async def get_detail(self, url: str, **kwargs) -> Result[T, str]:
        """详情页面爬取方法

        Args:
            url: 详情页URL
            **kwargs: 其他参数

        Returns:
            Result[T, str]: 详情数据
        """
        pass

    @abc.abstractmethod
    async def parse_search_results(self, content: str) -> Result[Any, str]:
        """解析搜索结果页面

        Args:
            content: 页面内容

        Returns:
            Result[Any, str]: 解析后的搜索结果
        """
        pass

    @abc.abstractmethod
    async def parse_detail_page(self, content: str, url: str) -> Result[Any, str]:
        """解析详情页面

        Args:
            content: 页面内容
            url: 页面URL

        Returns:
            Result[Any, str]: 解析后的详情数据
        """
        pass
