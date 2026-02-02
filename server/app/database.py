"""
database.py - SQLite persistence layer for FormCheck workout data.

Handles storage and retrieval of workout sessions, user settings, and
computed analytics (streaks, personal records, exercise distribution).

Thread Safety:
    Uses thread-local connections because SQLite connections cannot be
    shared across threads. Each thread gets its own connection via
    threading.local(). FastAPI runs request handlers in a thread pool,
    so this approach prevents "SQLite objects used in a thread" errors.

Tables:
    sessions: Workout session records (exercise, reps, duration, timestamp)
    settings: Key-value store for user preferences (e.g., weekly_goal)

Streak Calculation:
    Counts consecutive days with at least one session. A streak continues
    if the last session was today or yesterday—this forgives single-day
    gaps to reduce user anxiety about "breaking" streaks.

Usage:
    from app.database import db  # Global singleton
    db.save_session("Pushups", 25, 120)
    stats = db.get_stats()
"""

import sqlite3
from typing import List, Dict, Optional
import time
from pathlib import Path
import threading
from contextlib import contextmanager

# Database file location - relative to server working directory
DB_PATH = Path("formcheck.db")


# Database Schema:
#
# TABLE: sessions
# ┌─────────────┬──────────┬─────────────────────────────┐
# │ Column      │ Type     │ Description                 │
# ├─────────────┼──────────┼─────────────────────────────┤
# │ id          │ INTEGER  │ Primary key (autoincrement) │
# │ exercise    │ TEXT     │ Exercise name (Pushups, etc)│
# │ reps        │ INTEGER  │ Total reps or seconds       │
# │ duration    │ INTEGER  │ Session length in seconds   │
# │ timestamp   │ REAL     │ Unix timestamp (float)      │
# └─────────────┴──────────┴─────────────────────────────┘
#
# TABLE: settings
# ┌─────────┬──────┬───────────────────────────────┐
# │ Column  │ Type │ Description                   │
# ├─────────┼──────┼───────────────────────────────┤
# │ key     │ TEXT │ Setting name (primary key)    │
# │ value   │ TEXT │ Setting value (JSON serialized)│
# └─────────┴──────┴───────────────────────────────┘
#
# Example Queries:
#   - Get last 10 sessions: SELECT * FROM sessions ORDER BY timestamp DESC LIMIT 10
#   - Calculate streak: SELECT DISTINCT date(timestamp, 'unixepoch', 'localtime') ...
#   - Get PRs: SELECT exercise, MAX(reps) FROM sessions GROUP BY exercise


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

            # Streak Calculation Edge Cases:
            #
            # Case 1: User works out today at 11 PM, then tomorrow at 1 AM
            #   ✅ Counts as 2-day streak (uses date(), not 24-hour window)
            #
            # Case 2: User works out Monday, skips Tuesday, works out Wednesday
            #   ❌ Streak resets to 1 (no forgiveness for multi-day gaps)
            #
            # Case 3: Last workout was yesterday
            #   ✅ Streak continues (forgives single-day gap to reduce anxiety)
            #
            # Case 4: Timezone changes (user travels)
            #   ⚠️  Uses localtime from timestamp—may cause streak breaks on travel
            #
            # Case 5: Multiple workouts in same day
            #   ✅ Counted as 1 day (DISTINCT date() in query)

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
