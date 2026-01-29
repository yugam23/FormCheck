import sqlite3
from typing import List, Dict, Optional
import time
from pathlib import Path

DB_PATH = Path("formcheck.db")


class Database:
    def __init__(self):
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                exercise TEXT NOT NULL,
                reps INTEGER NOT NULL,
                duration INTEGER DEFAULT 0,
                timestamp REAL NOT NULL
            )
        """
        )
        conn.commit()
        conn.close()

    def save_session(self, exercise: str, reps: int, duration: int = 0):
        # Only save meaningful sessions
        if reps == 0 and duration == 0:
            return

        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO sessions (exercise, reps, duration, timestamp) VALUES (?, ?, ?, ?)",
            (exercise, reps, duration, time.time()),
        )
        conn.commit()
        conn.close()

    def get_recent_sessions(self, limit: int = 10) -> List[Dict]:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        if limit is None or limit < 0:
            cursor.execute("SELECT * FROM sessions ORDER BY timestamp DESC")
        else:
            cursor.execute(
                "SELECT * FROM sessions ORDER BY timestamp DESC LIMIT ?", (limit,)
            )

        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    def delete_session(self, session_id: int):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
        conn.commit()
        conn.close()

    def delete_all_sessions(self):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM sessions")
        conn.commit()
        conn.close()


# Global instance
db = Database()
