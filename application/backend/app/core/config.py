from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

# Đường dẫn tuyệt đối tới application/.env (không phụ thuộc thư mục đang chạy),
# nhờ đó backend tự nạp .env mà không cần cờ --env-file khi khởi động.
_ENV_FILE = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
    dataset_path: Path = Path("../../data/processed/climate_daily.parquet")
    duckdb_path: Path = Path("../../data/processed/climate.duckdb")
    ai_log_db_path: Path = Path("../../data/logs/ai_sessions.sqlite3")
    ai_model: str = ""
    gemini_api_key: str = ""

    model_config = SettingsConfigDict(env_file=str(_ENV_FILE), extra="ignore")


settings = Settings()
