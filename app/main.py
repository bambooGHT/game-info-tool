from contextlib import asynccontextmanager

from fastapi import FastAPI
from loguru import logger

from app._version import __git_sha__, __version__
from app.v0.router import router as v0_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up...")
    logger.info(f"Version: {__version__}")
    logger.info(f"Git sha: {__git_sha__}")
    logger.info("Startup complete")
    yield
    logger.info("Shutting down...")
    logger.info("Shutdown complete")


app = FastAPI(lifespan=lifespan)


app.include_router(v0_router)
