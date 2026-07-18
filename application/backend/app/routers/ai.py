from uuid import uuid4
from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, List, Optional

from app.models.ai import (
    AILogEntry,
    AnalysisProposal,
    AnalysisRequest,
    ApprovalRequest,
    ProposalStatus,
)
from app.services.sql_guard import ensure_read_only_sql
from app.services.python_guard import ensure_safe_python
from app.services.python_runner import run_python_analysis
from app.services.ai_service import AIService
from app.services.db import get_db_connection
from app.services.logger import get_ai_logs, log_ai_session

router = APIRouter()
_proposals: dict[str, AnalysisProposal] = {}
ai_service = AIService()


@router.post("/proposals", response_model=AnalysisProposal)
def create_proposal(request: AnalysisRequest) -> AnalysisProposal:
    try:
        # Translate question to code (SQL hoặc Python tùy kind)
        if request.kind == "python":
            ai_res = ai_service.translate_to_python(request.question)
        else:
            ai_res = ai_service.translate_to_sql(request.question)

        if not ai_res.get("code"):
            raise HTTPException(
                status_code=400,
                detail=ai_res.get("explanation", "Yêu cầu không hợp lệ hoặc không liên quan đến dữ liệu khí hậu.")
            )

        proposal = AnalysisProposal(
            id=str(uuid4()),
            question=request.question,
            code=ai_res.get("code", ""),
            explanation=ai_res.get("explanation", ""),
            kind=request.kind,
            status=ProposalStatus.DRAFT
        )

        _proposals[proposal.id] = proposal

        # Log session as draft
        log_ai_session(
            session_id=proposal.id,
            question=proposal.question,
            sql_code=proposal.code,
            explanation=proposal.explanation,
            status=ProposalStatus.DRAFT,
            kind=proposal.kind,
        )

        return proposal
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service translation failed: {e}")


@router.post("/proposals/{proposal_id}/approve", response_model=AnalysisProposal)
def approve_proposal(proposal_id: str, request: ApprovalRequest) -> AnalysisProposal:
    proposal = _get_proposal(proposal_id)
    # Validate code an toàn theo loại
    if proposal.kind == "python":
        ensure_safe_python(request.code)
    else:
        ensure_read_only_sql(request.code)

    updated = proposal.model_copy(update={"code": request.code, "status": ProposalStatus.APPROVED})
    _proposals[proposal_id] = updated

    # Log session as approved
    log_ai_session(
        session_id=proposal_id,
        question=updated.question,
        sql_code=updated.code,
        explanation=updated.explanation,
        status=ProposalStatus.APPROVED,
        kind=updated.kind,
    )

    return updated


@router.post("/proposals/{proposal_id}/reject", response_model=AnalysisProposal)
def reject_proposal(proposal_id: str) -> AnalysisProposal:
    proposal = _get_proposal(proposal_id)
    updated = proposal.model_copy(update={"status": ProposalStatus.REJECTED})
    _proposals[proposal_id] = updated
    
    # Log session as rejected
    log_ai_session(
        session_id=proposal_id,
        question=updated.question,
        sql_code=updated.code,
        explanation=updated.explanation,
        status=ProposalStatus.REJECTED,
        kind=updated.kind,
    )

    return updated


def _execute_sql(sql: str) -> list[dict[str, Any]]:
    ensure_read_only_sql(sql)
    conn = get_db_connection()
    try:
        cursor = conn.execute(sql)
        cols = [desc[0] for desc in cursor.description]
        records = []
        for row in cursor.fetchall():
            d = dict(zip(cols, row))
            for k, v in d.items():
                if hasattr(v, "strftime"):
                    d[k] = v.strftime("%Y-%m-%d")
            records.append(d)
        return records
    finally:
        conn.close()


@router.post("/proposals/{proposal_id}/execute")
def execute_proposal(proposal_id: str) -> Dict[str, Any]:
    proposal = _get_proposal(proposal_id)

    if proposal.status != ProposalStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Only approved proposals can be executed")

    code = proposal.code

    try:
        if proposal.kind == "python":
            outcome = run_python_analysis(code)
            records = outcome["results"]
            row_count = outcome["row_count"]
        else:
            records = _execute_sql(code)
            row_count = len(records)

        # Mark as EXECUTED
        updated = proposal.model_copy(update={"status": ProposalStatus.EXECUTED})
        _proposals[proposal_id] = updated

        # Log session as executed
        log_ai_session(
            session_id=proposal_id,
            question=proposal.question,
            sql_code=code,
            explanation=proposal.explanation,
            status=ProposalStatus.EXECUTED,
            row_count=row_count,
            kind=proposal.kind,
        )

        return {
            "proposal_id": proposal_id,
            "status": "success",
            "row_count": row_count,
            "results": records
        }
    except HTTPException:
        raise
    except Exception as e:
        # Log execution failure
        error_msg = str(e)
        log_ai_session(
            session_id=proposal_id,
            question=proposal.question,
            sql_code=code,
            explanation=proposal.explanation,
            status="failed",
            error_message=error_msg,
            kind=proposal.kind,
        )
        raise HTTPException(status_code=400, detail=f"Execution error: {error_msg}")


@router.get("/logs", response_model=List[AILogEntry])
def read_logs(
    limit: int = Query(default=100, ge=1, le=500),
    session_id: Optional[str] = Query(default=None),
) -> List[AILogEntry]:
    """Truy xuất lại nhật ký AI (yêu cầu, mã nguồn, giải thích, kết quả)."""
    rows = get_ai_logs(limit=limit, session_id=session_id)
    return [AILogEntry(**row) for row in rows]


def _coerce_status(raw: str) -> ProposalStatus:
    try:
        return ProposalStatus(raw)
    except ValueError:
        # Trạng thái ngoài enum (vd. "failed") coi như đã phê duyệt để có thể chạy lại
        return ProposalStatus.APPROVED


def _get_proposal(proposal_id: str) -> AnalysisProposal:
    proposal = _proposals.get(proposal_id)
    if proposal is not None:
        return proposal

    # Fallback: dựng lại proposal từ nhật ký SQLite (sống sót khi backend restart)
    rows = get_ai_logs(limit=1, session_id=proposal_id)
    if rows:
        row = rows[0]
        proposal = AnalysisProposal(
            id=row["session_id"],
            question=row["question"],
            code=row["sql_code"],
            explanation=row["explanation"],
            kind=row.get("kind", "sql") or "sql",
            status=_coerce_status(row["status"]),
        )
        _proposals[proposal_id] = proposal
        return proposal

    raise HTTPException(status_code=404, detail="Proposal not found")

