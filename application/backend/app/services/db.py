import duckdb
from pathlib import Path
from app.core.config import settings

def get_resolved_dataset_path() -> Path:
    # Try settings path
    p = settings.dataset_path
    if p.exists():
        return p.absolute()
    
    # Try finding it relative to this file's directory
    # Path of this file: application/backend/app/services/db.py
    # Root of workspace is 5 levels up
    root = Path(__file__).resolve().parents[4]
    p_alt = root / "data" / "processed" / "climate_daily.parquet"
    if p_alt.exists():
        return p_alt.absolute()
        
    return p.absolute()

def get_db_connection() -> duckdb.DuckDBPyConnection:
    """
    Establishes a connection to DuckDB and registers a view named 'climate_daily'
    pointing to the resolved Parquet file.
    """
    parquet_path = get_resolved_dataset_path()
    if not parquet_path.exists():
        raise FileNotFoundError(f"Processed dataset parquet file not found at: {parquet_path}")
        
    conn = duckdb.connect()
    # Create view pointing to parquet file so raw queries can refer to 'climate_daily'
    conn.execute(f"CREATE OR REPLACE VIEW climate_daily AS SELECT * FROM read_parquet('{str(parquet_path)}')")
    return conn
