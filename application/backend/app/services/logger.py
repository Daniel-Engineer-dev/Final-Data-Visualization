import sqlite3
import datetime
import logging
from pathlib import Path
from app.core.config import settings

_log = logging.getLogger(__name__)

def init_log_db():
    log_db_path = settings.ai_log_db_path
    log_db_path.parent.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(str(log_db_path))
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ai_logs (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            question TEXT NOT NULL,
            sql_code TEXT NOT NULL,
            explanation TEXT NOT NULL,
            status TEXT NOT NULL,
            error_message TEXT,
            row_count INTEGER
        )
    """)
    conn.commit()
    conn.close()

def log_ai_session(
    session_id: str,
    question: str,
    sql_code: str,
    explanation: str,
    status: str,
    error_message: str = None,
    row_count: int = 0
):
    try:
        init_log_db()
        log_db_path = settings.ai_log_db_path
        conn = sqlite3.connect(str(log_db_path))
        cursor = conn.cursor()
        
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        cursor.execute("""
            INSERT OR REPLACE INTO ai_logs 
            (id, timestamp, question, sql_code, explanation, status, error_message, row_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (session_id, timestamp, question, sql_code, explanation, status, error_message, row_count))
        
        conn.commit()
        conn.close()
    except Exception as e:
        _log.warning("Error logging AI session: %s", e)
