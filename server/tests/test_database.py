import pytest
import sqlite3
from app.database import Database
import os

# Mock DB Path to use memory logic or temp file
# Since Database class hardcodes path in __init__ (sort of) or module level?
# app/database.py defines DB_PATH = Path("formcheck.db")
# We can patch this or use a temporary directory fixture if we want real file test
# Or better, subclass/mock for test.

# However, Database class uses `DB_PATH` from global scope.
# We can monkeypatch `app.database.DB_PATH` 

@pytest.fixture
def temp_db(tmp_path):
    db_file = tmp_path / "test_formcheck.db"
    # Monkeypatching logic if possible, or we just rely on the fact that we can 
    # redirect the sqlite3.connect call.
    
    # Actually, let's just use the Database class but point it to a test file?
    # The class doesn't accept a path in __init__.
    # We should probably refactor Database to accept path, but for Tier 1 we test what exists.
    # We can patch `app.database.DB_PATH`
    
    import app.database
    original_path = app.database.DB_PATH
    app.database.DB_PATH = db_file
    
    db = Database() # This calls _init_db
    yield db
    
    app.database.DB_PATH = original_path
    if os.path.exists(db_file):
        os.remove(db_file)

def test_save_session(temp_db):
    temp_db.save_session("Pushups", 10, 60)
    sessions = temp_db.get_recent_sessions()
    assert len(sessions) == 1
    assert sessions[0]['exercise'] == "Pushups"
    assert sessions[0]['reps'] == 10

def test_save_empty_session(temp_db):
    temp_db.save_session("Pushups", 0, 0)
    sessions = temp_db.get_recent_sessions()
    assert len(sessions) == 0

def test_get_stats(temp_db):
    temp_db.save_session("Pushups", 10, 0)
    temp_db.save_session("Squats", 20, 0)
    stats = temp_db.get_stats()
    assert stats['total_reps'] == 30
    assert stats['total_sessions'] == 2

def test_delete_session(temp_db):
    temp_db.save_session("Pushups", 10, 0)
    sessions = temp_db.get_recent_sessions()
    session_id = sessions[0]['id']
    
    temp_db.delete_session(session_id)
    assert len(temp_db.get_recent_sessions()) == 0

def test_goal(temp_db):
    assert temp_db.get_goal() == 500 # Default
    temp_db.set_goal(100)
    assert temp_db.get_goal() == 100
