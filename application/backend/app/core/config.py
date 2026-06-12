from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    dataset_path: Path = Path("../../data/processed/climate_daily.parquet")
    duckdb_path: Path = Path("../../data/processed/climate.duckdb")
    ai_log_db_path: Path = Path("../../data/logs/ai_sessions.sqlite3")
    ai_model: str = ""

    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")


settings = Settings()
