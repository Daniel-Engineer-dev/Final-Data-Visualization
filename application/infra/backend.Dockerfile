FROM python:3.12-slim
WORKDIR /workspace/application/backend
COPY application/backend/pyproject.toml .
COPY application/backend/app ./app
RUN pip install --no-cache-dir .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
