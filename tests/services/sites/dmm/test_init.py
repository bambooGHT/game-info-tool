from app.services.sites.dmm import DMMCrawler


class TestDMMInit:
    """测试 DMM 初始化和配置"""

    def test_default_initialization(self):
        """测试默认初始化"""
        crawler = DMMCrawler()

        assert crawler.base_url == "https://www.dmm.co.jp"
        assert crawler.timeout == 30
        assert crawler.max_retries == 3
        assert crawler.request_delay == (0.5, 2.0)
        assert crawler.respect_robots_txt is False

    def test_custom_initialization(self):
        """测试自定义初始化参数"""
        crawler = DMMCrawler(timeout=60, max_retries=5, request_delay=(1.0, 3.0))

        assert crawler.timeout == 60
        assert crawler.max_retries == 5
        assert crawler.request_delay == (1.0, 3.0)
