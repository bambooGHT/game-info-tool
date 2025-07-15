import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from loguru import logger

from app._version import __version__
from app.configs import config
from app.v0.router import router as v0_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.remove()
    logger.add(sys.stdout, level=config.log_level)
    logger.info("Starting up...")
    logger.info(f"Version: {__version__}")
    logger.info(config.print_config())
    logger.info("Startup complete")
    yield
    logger.info("Shutting down...")
    logger.complete()
    logger.info("Shutdown complete")


app = FastAPI(lifespan=lifespan)


app.include_router(v0_router)
