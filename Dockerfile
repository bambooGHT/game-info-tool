FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY . /app

RUN uv sync --frozen --no-cache

CMD ["./.venv/bin/uvicorn", "app.main:app", "--host", "::", "--port", "8000"]
