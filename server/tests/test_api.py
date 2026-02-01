from fastapi.testclient import TestClient
import pytest
from main import app
from app.database import db

# Override DB to use a temporary file or mock for API tests
# Similar to test_database.py, but applied to the app's global db instance


@pytest.fixture
def client():
    # Setup
    with TestClient(app) as c:
        yield c
    # Teardown (optional clean db)


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_get_sessions(client):
    response = client.get("/api/sessions")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_save_and_delete_session(client):
    # 1. Save
    payload = {"exercise": "API Test", "reps": 5, "duration": 10}
    response = client.post("/api/save-session", json=payload)
    assert response.status_code == 200

    # 2. Verify
    sessions = client.get("/api/sessions").json()
    saved = next((s for s in sessions if s["exercise"] == "API Test"), None)
    assert saved is not None
    assert saved["reps"] == 5

    # 3. Delete
    response = client.delete(f"/api/sessions/{saved['id']}")
    assert response.status_code == 200

    # 4. Verify Gone
    sessions = client.get("/api/sessions").json()
    saved = next((s for s in sessions if s["exercise"] == "API Test"), None)
    assert saved is None


def test_goal_endpoints(client):
    # Set Goal
    response = client.post("/api/settings/goal", json={"goal": 888})
    assert response.status_code == 200

    # Get Goal
    response = client.get("/api/settings/goal")
    assert response.status_code == 200
    assert response.json()["goal"] == 888
