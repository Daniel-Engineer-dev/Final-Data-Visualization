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
    assert len(data["counts_by_year"]) == 6
    assert len(data["counts_by_month"]) == 12

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
    # AI gợi ý biểu đồ kèm theo
    assert proposal["chart"] and proposal["chart"]["x"] and proposal["chart"]["y"]
    
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

    # 4. Logs are retrievable and keep the full audit trail (draft -> approved -> executed)
    resp_logs = client.get(f"/api/ai/logs?session_id={proposal_id}")
    assert resp_logs.status_code == 200
    logs = resp_logs.json()
    statuses = {row["status"] for row in logs}
    assert {"draft", "approved", "executed"}.issubset(statuses)
    executed_row = next(row for row in logs if row["status"] == "executed")
    assert executed_row["row_count"] and executed_row["row_count"] > 0
    assert executed_row["question"] == req_payload["question"]


def test_proposal_survives_backend_restart() -> None:
    """A1: proposal phải chạy được kể cả khi bộ nhớ RAM bị xóa (mô phỏng restart)."""
    from app.routers import ai as ai_router

    resp_create = client.post(
        "/api/ai/proposals",
        json={"question": "Ngày nào nhiệt độ cao nhất tại Hà Nội?"},
    )
    assert resp_create.status_code == 200
    proposal = resp_create.json()
    proposal_id = proposal["id"]

    # Mô phỏng backend restart: bộ nhớ tạm mất sạch
    ai_router._proposals.clear()

    # Vẫn phê duyệt được nhờ đọc lại từ SQLite
    resp_approve = client.post(
        f"/api/ai/proposals/{proposal_id}/approve",
        json={"code": proposal["code"]},
    )
    assert resp_approve.status_code == 200

    ai_router._proposals.clear()  # restart lần nữa trước khi execute
    resp_execute = client.post(f"/api/ai/proposals/{proposal_id}/execute")
    assert resp_execute.status_code == 200
    assert resp_execute.json()["status"] == "success"


def test_ai_python_flow() -> None:
    """B5: AI sinh code pandas, phê duyệt và thực thi cục bộ."""
    resp_create = client.post(
        "/api/ai/proposals",
        json={"question": "Xếp hạng các địa điểm nóng nhất", "kind": "python"},
    )
    assert resp_create.status_code == 200
    proposal = resp_create.json()
    assert proposal["kind"] == "python"
    assert "result" in proposal["code"]
    proposal_id = proposal["id"]

    # Code độc hại (import) phải bị guard chặn
    resp_bad = client.post(
        f"/api/ai/proposals/{proposal_id}/approve",
        json={"code": "import os\nresult = os.listdir('.')"},
    )
    assert resp_bad.status_code == 400

    # Phê duyệt code an toàn rồi thực thi
    resp_approve = client.post(
        f"/api/ai/proposals/{proposal_id}/approve",
        json={"code": proposal["code"]},
    )
    assert resp_approve.status_code == 200

    resp_execute = client.post(f"/api/ai/proposals/{proposal_id}/execute")
    assert resp_execute.status_code == 200
    exec_data = resp_execute.json()
    assert exec_data["status"] == "success"
    assert len(exec_data["results"]) > 0

    # Log ghi đúng loại python
    resp_logs = client.get(f"/api/ai/logs?session_id={proposal_id}")
    assert any(row["kind"] == "python" for row in resp_logs.json())


def test_python_guard_blocks_dunder() -> None:
    """Guard chặn truy cập dunder để né sandbox."""
    from app.services.python_guard import ensure_safe_python
    from fastapi import HTTPException

    with pytest.raises(HTTPException):
        ensure_safe_python("result = ().__class__.__bases__")
