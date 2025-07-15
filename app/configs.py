import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    def __init__(self):
        self.log_level = self.get_log_level()
        self.proxy = self.get_proxy()

    def print_config(self):
        return f"""
        LOG_LEVEL: {self.log_level}
        PROXY: {self.proxy}
        """

    def get_log_level(self):
        return os.getenv("LOG_LEVEL", "INFO")

    def get_proxy(self):
        return os.getenv("PROXY", "")


config = Config()
