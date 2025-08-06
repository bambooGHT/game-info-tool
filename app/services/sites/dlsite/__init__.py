from app.services.sites.dlsite.process import run as dlsite_process
from app.services.sites.dlsite.process import get_search_html as dlsite_get_search_html
from app.services.sites.dlsite.process import get_detail_html as dlsite_get_detail_html
from app.services.sites.dlsite.process import search as dlsite_search
from app.services.sites.dlsite.process import detail as dlsite_detail


__all__ = [
    "dlsite_detail",
    "dlsite_get_detail_html",
    "dlsite_get_search_html",
    "dlsite_process",
    "dlsite_search",
]
