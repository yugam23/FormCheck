import sqlite3
from typing import List, Dict, Optional
import time
from pathlib import Path
import threading
from contextlib import contextmanager

DB_PATH = Path("formcheck.db")


class Database:
    def __init__(self):
        self._local = threading.local()
        # Ensure tables exist on startup (main thread)
        self._init_db()

    @contextmanager
    def get_connection(self):
        # Create a thread-local connection if it doesn't exist
        if not hasattr(self._local, "conn"):
            self._local.conn = sqlite3.connect(DB_PATH, check_same_thread=False)
            self._local.conn.row_factory = sqlite3.Row

        try:
            yield self._local.conn
        except Exception:
            # On error, we might want to rollback, but sqlite does this automatically on close usually?
            # Actually with a persistent connection, we should ensure manual rollback or just let context handle it if we wrapped transaction
            # But here we just yield connection.
            raise

    def _init_db(self):
        # Direct connection for initialization to avoid thread-local in init
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

        # Settings Table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        """
        )
        conn.commit()
        conn.close()

    def get_goal(self) -> int:
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT value FROM settings WHERE key = 'weekly_goal'")
            row = cursor.fetchone()
            return int(row[0]) if row else 500  # Default 500

    def set_goal(self, goal: int):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT OR REPLACE INTO settings (key, value) VALUES ('weekly_goal', ?)",
                (str(goal),),
            )
            conn.commit()

    def save_session(self, exercise: str, reps: int, duration: int = 0):
        # Only save meaningful sessions
        if reps == 0 and duration == 0:
            return

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO sessions (exercise, reps, duration, timestamp) VALUES (?, ?, ?, ?)",
                (exercise, reps, duration, time.time()),
            )
            conn.commit()

    def get_recent_sessions(self, limit: int = 10) -> List[Dict]:
        with self.get_connection() as conn:
            cursor = conn.cursor()

            if limit < 0:
                # Standardize "all" or "no limit"
                cursor.execute("SELECT * FROM sessions ORDER BY timestamp DESC")
            else:
                cursor.execute(
                    "SELECT * FROM sessions ORDER BY timestamp DESC LIMIT ?", (limit,)
                )

            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def get_stats(self) -> Dict:
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Total Reps and Sessions
            cursor.execute("SELECT SUM(reps), COUNT(*) FROM sessions")
            row = cursor.fetchone()
            total_reps = row[0] if row and row[0] else 0
            total_sessions = row[1] if row and row[1] else 0

            # Streak Calculation
            cursor.execute(
                "SELECT DISTINCT date(timestamp, 'unixepoch', 'localtime') as day FROM sessions ORDER BY day DESC"
            )
            dates = [row[0] for row in cursor.fetchall()]

            streak = 0
            if dates:
                from datetime import datetime, timedelta

                today = datetime.now().date()
                yesterday = today - timedelta(days=1)

                # Check if last session was today or yesterday to keep streak alive
                last_session_date = datetime.strptime(dates[0], "%Y-%m-%d").date()

                if last_session_date == today or last_session_date == yesterday:
                    streak = 1
                    current_check = last_session_date

                    for i in range(1, len(dates)):
                        prev_date = datetime.strptime(dates[i], "%Y-%m-%d").date()
                        if prev_date == current_check - timedelta(days=1):
                            streak += 1
                            current_check = prev_date
                        else:
                            break
                else:
                    streak = 0

            return {
                "total_reps": total_reps,
                "total_sessions": total_sessions,
                "day_streak": streak,
            }

    def get_analytics(self) -> Dict:
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # 1. Exercise Distribution (Pie Chart)
            cursor.execute("SELECT exercise, COUNT(*) FROM sessions GROUP BY exercise")
            distribution = [
                {"name": row[0], "value": row[1]} for row in cursor.fetchall()
            ]

            # 2. Personal Records (Max Reps per Exercise)
            cursor.execute("SELECT exercise, MAX(reps) FROM sessions GROUP BY exercise")
            prs = [{"exercise": row[0], "reps": row[1]} for row in cursor.fetchall()]

            return {"distribution": distribution, "prs": prs}

    def delete_session(self, session_id: int):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
            conn.commit()

    def delete_all_sessions(self):
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM sessions")
            conn.commit()

    def close(self):
        """Close the thread-local connection if it exists."""
        if hasattr(self._local, "conn"):
            self._local.conn.close()
            del self._local.conn


# Global instance
db = Database()
