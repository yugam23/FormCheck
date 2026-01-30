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
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM settings WHERE key = 'weekly_goal'")
        row = cursor.fetchone()
        conn.close()
        return int(row[0]) if row else 500  # Default 500

    def set_goal(self, goal: int):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES ('weekly_goal', ?)",
            (str(goal),),
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

    def get_stats(self) -> Dict:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Total Reps and Sessions
        cursor.execute("SELECT SUM(reps), COUNT(*) FROM sessions")
        total_reps, total_sessions = cursor.fetchone()
        total_reps = total_reps if total_reps else 0

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

        conn.close()
        return {
            "total_reps": total_reps,
            "total_sessions": total_sessions,
            "day_streak": streak,
        }

    def get_analytics(self) -> Dict:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # 1. Exercise Distribution (Pie Chart)
        cursor.execute("SELECT exercise, COUNT(*) FROM sessions GROUP BY exercise")
        distribution = [{"name": row[0], "value": row[1]} for row in cursor.fetchall()]

        # 2. Personal Records (Max Reps per Exercise)
        cursor.execute("SELECT exercise, MAX(reps) FROM sessions GROUP BY exercise")
        prs = [{"exercise": row[0], "reps": row[1]} for row in cursor.fetchall()]

        conn.close()
        return {"distribution": distribution, "prs": prs}

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
