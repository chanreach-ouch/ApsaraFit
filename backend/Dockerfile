FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for OpenCV and Trimesh
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run database seeder on container startup if tailor.db not found, then launch uvicorn
CMD ["sh", "-c", "python app/seed.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
