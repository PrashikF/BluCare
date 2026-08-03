import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_start_session():
    response = client.post("/session/start", json={})
    assert response.status_code == 200
    data = response.json()
    assert "thread_id" in data
    assert "message" in data
    assert isinstance(data["thread_id"], str)

def test_start_session_with_message():
    response = client.post("/session/start", json={"initial_message": "Hi, I feel sick."})
    assert response.status_code == 200
    data = response.json()
    assert "thread_id" in data
    assert "message" in data

def test_message_validation():
    # Test that a message exceeding max length gets blocked by Pydantic
    long_message = "A" * 3000
    response = client.post("/session/message", json={"thread_id": "1234", "message": long_message})
    # Should throw 422 Unprocessable Entity due to max_length=2000
    assert response.status_code == 422
