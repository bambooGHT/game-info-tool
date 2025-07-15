import os

from dotenv import load_dotenv

load_dotenv()


class Config:
    def __init__(self):
        self.log_level = self.get_log_level()

    def print_config(self):
        return f"""
        LOG_LEVEL: {self.log_level}
        """

    def get_log_level(self):
        return os.getenv("LOG_LEVEL", "INFO")


config = Config()
