from app.services.sites.twodfan.process import run as twodfan_process
from app.services.sites.twodfan.process import search_html as twodfan_search_html
from app.services.sites.twodfan.process import detail_html as twodfan_detail_html
from app.services.sites.twodfan.process import search as twodfan_search
from app.services.sites.twodfan.process import detail as twodfan_detail
from app.services.sites.twodfan.process import image as twodfan_image


__all__ = [
    "twodfan_detail",
    "twodfan_detail_html",
    "twodfan_image",
    "twodfan_search_html",
    "twodfan_process",
    "twodfan_search",
]
