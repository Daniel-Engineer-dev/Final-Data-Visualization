"""Thực thi cục bộ đoạn code pandas do AI sinh (đã qua guard + phê duyệt)."""

from typing import Any, Dict, List

import pandas as pd
from fastapi import HTTPException

from app.services.db import get_db_connection
from app.services.python_guard import SAFE_BUILTINS, ensure_safe_python

_MAX_ROWS = 500


def _load_dataframe() -> pd.DataFrame:
    conn = get_db_connection()
    try:
        df = conn.execute("SELECT * FROM climate_daily").fetchdf()
    finally:
        conn.close()
    return df


def _to_records(result: Any) -> List[Dict[str, Any]]:
    """Chuẩn hóa kết quả (DataFrame / Series / scalar / dict) về list bản ghi."""
    if isinstance(result, pd.DataFrame):
        frame = result.head(_MAX_ROWS).copy()
    elif isinstance(result, pd.Series):
        frame = result.head(_MAX_ROWS).reset_index()
    elif isinstance(result, dict):
        frame = pd.DataFrame([result])
    elif isinstance(result, (list, tuple)):
        frame = pd.DataFrame(list(result))
    else:
        frame = pd.DataFrame([{"result": result}])

    # Chuyển cột ngày/giờ về chuỗi để JSON hóa an toàn
    for col in frame.columns:
        if pd.api.types.is_datetime64_any_dtype(frame[col]):
            frame[col] = frame[col].dt.strftime("%Y-%m-%d")

    frame = frame.where(pd.notnull(frame), None)
    return frame.to_dict(orient="records")


def run_python_analysis(code: str) -> Dict[str, Any]:
    ensure_safe_python(code)

    df = _load_dataframe()
    sandbox_globals: Dict[str, Any] = {
        "__builtins__": SAFE_BUILTINS,
        "pd": pd,
        "df": df,
    }
    sandbox_locals: Dict[str, Any] = {}

    try:
        exec(code, sandbox_globals, sandbox_locals)  # noqa: S102 - đã qua guard + phê duyệt
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi thực thi code Python: {e}")

    if "result" not in sandbox_locals:
        raise HTTPException(
            status_code=400,
            detail="Code chạy xong nhưng không tạo biến `result`.",
        )

    records = _to_records(sandbox_locals["result"])
    return {"row_count": len(records), "results": records}
