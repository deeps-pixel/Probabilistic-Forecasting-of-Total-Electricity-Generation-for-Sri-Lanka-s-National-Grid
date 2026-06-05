# --------------------------------------------------------------
# Dockerfile – Energy‑Grid Dashboard
# --------------------------------------------------------------
# Base image – slim, recent Python with security patches
FROM python:3.12-slim

# --------------------------------------------------------------
# Install OS build tools (required for pandas, numpy, etc.)
# --------------------------------------------------------------
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# --------------------------------------------------------------
# Create a non‑root user (best practice)
# --------------------------------------------------------------
ARG USERNAME=appuser
ARG UID=1000
ARG GID=1000
RUN addgroup --gid $GID $USERNAME && \
    adduser --uid $UID --gid $GID --disabled-password --gecos "" $USERNAME

# --------------------------------------------------------------
# Working directory inside the container
# --------------------------------------------------------------
WORKDIR /app

# --------------------------------------------------------------
# Install Python dependencies – copy only requirements.txt first to cache layer
# --------------------------------------------------------------
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --------------------------------------------------------------
# Copy the entire source tree (static files, data, models, etc.)
# --------------------------------------------------------------
COPY . .

# --------------------------------------------------------------
# Environment variables – placeholder for Gemini API key (override at runtime)
# --------------------------------------------------------------
ENV GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# --------------------------------------------------------------
# Expose the port the FastAPI app listens on
# --------------------------------------------------------------
EXPOSE 8001

# --------------------------------------------------------------
# Switch to the non‑root user
# --------------------------------------------------------------
USER $USERNAME

# --------------------------------------------------------------
# Default command – start the FastAPI server (keep --reload for dev, remove for prod)
# --------------------------------------------------------------
CMD ["uvicorn", "backend:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]
