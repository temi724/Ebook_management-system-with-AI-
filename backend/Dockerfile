# ──────────────────────────────────────────────────────────────────────────
# AI E-Library — FastAPI backend
# Python 3.11 is required: the pinned dependencies have no wheels for 3.14.
# ──────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim

# Build tools for any packages that compile from source.
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    # Cache the downloaded embedding model here so it survives restarts
    # when this path is mounted as a volume.
    HF_HOME=/app/.cache/huggingface

WORKDIR /app

# Install dependencies first for better layer caching.
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install -r requirements.txt \
    # The pinned sentence-transformers (2.2.2) is incompatible with the modern
    # transformers/huggingface_hub it pulls in (it imports the removed
    # `cached_download`). Upgrade to a working combination.
    && pip install -U sentence-transformers huggingface_hub

# Application code.
COPY . .

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -fsS http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
