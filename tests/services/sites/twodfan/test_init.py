from app.services.sites.twodfan import TwoDFanCrawler


class TestTwoDFanInit:
    """测试 TwoDFan 初始化和配置"""

    def test_default_initialization(self):
        """测试默认初始化"""
        crawler = TwoDFanCrawler()

        assert crawler.base_url == "https://2dfan.com"
        assert crawler.timeout == 30
        assert crawler.max_retries == 3
        assert crawler.respect_robots_txt is False

    def test_custom_initialization(self):
        """测试自定义初始化参数"""
        crawler = TwoDFanCrawler(timeout=60, max_retries=5, request_delay=(1.0, 3.0))

        assert crawler.timeout == 60
        assert crawler.max_retries == 5
        assert crawler.request_delay == (1.0, 3.0)
