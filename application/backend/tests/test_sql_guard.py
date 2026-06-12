import pytest
from fastapi import HTTPException

from app.services.sql_guard import ensure_read_only_sql


def test_allows_select() -> None:
    ensure_read_only_sql("SELECT * FROM climate_daily")


@pytest.mark.parametrize("sql", ["DROP TABLE climate_daily", "SELECT 1; DELETE FROM climate_daily"])
def test_blocks_unsafe_sql(sql: str) -> None:
    with pytest.raises(HTTPException):
        ensure_read_only_sql(sql)

