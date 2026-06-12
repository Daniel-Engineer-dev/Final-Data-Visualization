import re

from fastapi import HTTPException

_FORBIDDEN = re.compile(
    r"\b(insert|update|delete|drop|alter|create|replace|truncate|attach|detach|copy)\b",
    re.IGNORECASE,
)


def ensure_read_only_sql(sql: str) -> None:
    normalized = sql.strip()
    if not normalized.lower().startswith(("select", "with")):
        raise HTTPException(status_code=400, detail="Only SELECT or WITH queries are allowed")
    if _FORBIDDEN.search(normalized):
        raise HTTPException(status_code=400, detail="Query contains a forbidden operation")
    if ";" in normalized.rstrip(";"):
        raise HTTPException(status_code=400, detail="Only one SQL statement is allowed")

