import sqlite3
import datetime
import logging
from typing import Any, Dict, List, Optional

from app.core.config import settings

_log = logging.getLogger(__name__)

# Append-only audit table: MỖI sự kiện (draft/approved/rejected/executed/failed)
# được ghi thành MỘT dòng riêng để giữ đầy đủ dấu vết theo yêu cầu đề bài
# ("lưu trữ tất cả các yêu cầu, mã nguồn, kết quả phân tích và giải thích").
_TABLE = "ai_events"


def init_log_db() -> None:
    log_db_path = settings.ai_log_db_path
    log_db_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(str(log_db_path))
    cursor = conn.cursor()
    cursor.execute(
        f"""
        CREATE TABLE IF NOT EXISTS {_TABLE} (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            question TEXT NOT NULL,
            sql_code TEXT NOT NULL,
            explanation TEXT NOT NULL,
            kind TEXT NOT NULL DEFAULT 'sql',
            status TEXT NOT NULL,
            error_message TEXT,
            row_count INTEGER
        )
        """
    )
    # Migration: thêm cột kind cho bảng cũ chưa có
    cols = {row[1] for row in cursor.execute(f"PRAGMA table_info({_TABLE})").fetchall()}
    if "kind" not in cols:
        cursor.execute(f"ALTER TABLE {_TABLE} ADD COLUMN kind TEXT NOT NULL DEFAULT 'sql'")
    cursor.execute(
        f"CREATE INDEX IF NOT EXISTS idx_{_TABLE}_session ON {_TABLE}(session_id)"
    )
    conn.commit()
    conn.close()


def log_ai_session(
    session_id: str,
    question: str,
    sql_code: str,
    explanation: str,
    status: str,
    error_message: Optional[str] = None,
    row_count: int = 0,
    kind: str = "sql",
) -> None:
    try:
        init_log_db()
        conn = sqlite3.connect(str(settings.ai_log_db_path))
        cursor = conn.cursor()

        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

        cursor.execute(
            f"""
            INSERT INTO {_TABLE}
            (session_id, timestamp, question, sql_code, explanation, kind, status, error_message, row_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                session_id,
                timestamp,
                question,
                sql_code,
                explanation,
                kind,
                status,
                error_message,
                row_count,
            ),
        )

        conn.commit()
        conn.close()
    except Exception as e:
        _log.warning("Error logging AI session: %s", e)


def get_ai_logs(
    limit: int = 100,
    session_id: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Đọc lại nhật ký AI để truy xuất (mới nhất trước)."""
    try:
        init_log_db()
        conn = sqlite3.connect(str(settings.ai_log_db_path))
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        if session_id:
            cursor.execute(
                f"SELECT * FROM {_TABLE} WHERE session_id = ? ORDER BY id DESC LIMIT ?",
                (session_id, limit),
            )
        else:
            cursor.execute(
                f"SELECT * FROM {_TABLE} ORDER BY id DESC LIMIT ?",
                (limit,),
            )

        rows = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return rows
    except Exception as e:
        _log.warning("Error reading AI logs: %s", e)
        return []
