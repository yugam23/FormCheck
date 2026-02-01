from fastapi.testclient import TestClient
from main import app
import pytest

client = TestClient(app)


def test_validation_limit_max():
    # Limit <= 1000
    response = client.get("/api/sessions?limit=1001")
    assert response.status_code == 422
    assert (
        "input_should_be_less_than_or_equal" in response.text
        or "less_than_equal" in response.text
    )


def test_validation_limit_min():
    # Limit >= -1
    response = client.get("/api/sessions?limit=-2")
    assert response.status_code == 422
    assert (
        "input_should_be_greater_than_or_equal" in response.text
        or "greater_than_equal" in response.text
    )


def test_validation_limit_all():
    # Limit = -1 (All)
    response = client.get("/api/sessions?limit=-1")
    assert response.status_code == 200


def test_rate_limiting():
    # The limit is 60/minute.
    # We need to send > 60 requests.
    # Note: slowapi uses memory storage by default, so it resets on restart, but persists across requests in same process.
    # TestClient reuses the app instance.

    # We might need to mock the remote address to ensure we trigger the limit for "this" client
    # TestClient usually sets client host to testclient or 127.0.0.1

    # Let's hit /api/analytics which has 30/minute limit (faster to hit)

    # First 30 should be OK (or maybe 2xx)
    for _ in range(30):
        response = client.get("/api/analytics")
        if response.status_code == 429:
            break

    # The 31st should definitely fail
    response = client.get("/api/analytics")
    assert response.status_code == 429
