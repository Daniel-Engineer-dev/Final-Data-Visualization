from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import ai, dataset, health

app = FastAPI(
    title="Vietnam Climate Pulse API",
    version="0.1.0",
    description="Local-first climate analytics API with human-approved AI execution.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(dataset.router, prefix="/api/dataset", tags=["dataset"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])

