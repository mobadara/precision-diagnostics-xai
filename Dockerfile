# --- Base Build Stage ---
FROM python:3.11-slim

# Create a non-root user specifically for Hugging Face (User ID 1000)
RUN useradd -m -u 1000 user
USER user

# Set environment variables
ENV PATH="/home/user/.local/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies required by OpenCV and PyTorch image handling
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*
USER user

# Work from the repository root so the backend package imports resolve correctly
WORKDIR /app

# Install Python dependencies from the backend package
COPY --chown=user ./backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/backend/requirements.txt

# Copy the backend package into the image
COPY --chown=user ./backend /app/backend

# Expose the specific port Hugging Face requires
EXPOSE 7860

# Launch the FastAPI server from the backend package
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "7860"]