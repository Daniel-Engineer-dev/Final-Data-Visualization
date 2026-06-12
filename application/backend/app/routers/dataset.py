from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/metadata")
def dataset_metadata() -> dict[str, object]:
    path = settings.dataset_path
    return {
        "name": "Vietnam Climate Daily",
        "path": str(path),
        "available": path.exists(),
        "grain": "one location per day",
        "required_dimensions": ["date", "location", "latitude", "longitude"],
    }

