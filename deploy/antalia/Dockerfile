FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 && \
    rm -rf /var/lib/apt/lists/*

# CPU-only PyTorch keeps the image smaller and works on this host.
RUN pip install "torch==2.15.0+cpu" --index-url https://download.pytorch.org/whl/cpu

RUN pip install "antalia-mini==1.0.1"

WORKDIR /app
COPY server.py .

ENV ANTALIA_MODEL=/models/antalia-mini \
    ANTALIA_SAMPLE_RATE=24000

EXPOSE 8099

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8099/health', timeout=5)"

CMD ["python", "server.py"]
