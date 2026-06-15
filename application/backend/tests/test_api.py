import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.ai import ProposalStatus

client = TestClient(app)

def test_health_check() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_dataset_metadata() -> None:
    response = client.get("/api/dataset/metadata")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert data["available"] is True

def test_dataset_overview() -> None:
    response = client.get("/api/dataset/overview")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        first = data[0]
        assert "location" in first
        assert "avg_temp" in first

def test_dataset_explorer() -> None:
    response = client.get("/api/dataset/explorer?location=Ha%20Noi")
    assert response.status_code == 200
    data = response.json()
    assert "monthly_trends" in data
    assert "heatmap_matrix" in data

def test_dataset_extreme_events() -> None:
    response = client.get("/api/dataset/extreme-events?temp_threshold=35.0")
    assert response.status_code == 200
    data = response.json()
    assert "hot_days" in data
    assert "wet_days" in data

def test_dataset_relationship() -> None:
    response = client.get("/api/dataset/relationship")
    assert response.status_code == 200
    data = response.json()
    assert "scatter_sample" in data
    assert "correlation_matrix" in data

def test_ai_analyst_flow() -> None:
    # 1. Create Proposal
    req_payload = {"question": "So sánh lượng mưa giữa Đà Nẵng và Thành phố Hồ Chí Minh theo mùa."}
    resp_create = client.post("/api/ai/proposals", json=req_payload)
    assert resp_create.status_code == 200
    proposal = resp_create.json()
    proposal_id = proposal["id"]
    assert proposal["status"] == ProposalStatus.DRAFT
    assert "SELECT" in proposal["code"]
    
    # 2. Approve Proposal (Unsafe SQL should fail)
    unsafe_payload = {"code": "DROP TABLE climate_daily"}
    resp_approve_unsafe = client.post(f"/api/ai/proposals/{proposal_id}/approve", json=unsafe_payload)
    assert resp_approve_unsafe.status_code == 400
    
    # Approve with safe SQL
    safe_sql = proposal["code"]
    resp_approve = client.post(f"/api/ai/proposals/{proposal_id}/approve", json={"code": safe_sql})
    assert resp_approve.status_code == 200
    assert resp_approve.json()["status"] == ProposalStatus.APPROVED
    
    # 3. Execute Proposal
    resp_execute = client.post(f"/api/ai/proposals/{proposal_id}/execute")
    assert resp_execute.status_code == 200
    exec_data = resp_execute.json()
    assert exec_data["status"] == "success"
    assert "results" in exec_data
    assert len(exec_data["results"]) > 0
