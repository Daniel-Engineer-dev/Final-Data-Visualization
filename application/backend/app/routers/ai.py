from uuid import uuid4
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

from app.models.ai import AnalysisProposal, AnalysisRequest, ApprovalRequest, ProposalStatus
from app.services.sql_guard import ensure_read_only_sql
from app.services.ai_service import AIService
from app.services.db import get_db_connection
from app.services.logger import log_ai_session

router = APIRouter()
_proposals: dict[str, AnalysisProposal] = {}
ai_service = AIService()


@router.post("/proposals", response_model=AnalysisProposal)
def create_proposal(request: AnalysisRequest) -> AnalysisProposal:
    try:
        # Translate question to SQL
        ai_res = ai_service.translate_to_sql(request.question)
        
        proposal = AnalysisProposal(
            id=str(uuid4()),
            question=request.question,
            code=ai_res.get("code", ""),
            explanation=ai_res.get("explanation", ""),
            status=ProposalStatus.DRAFT
        )
        
        _proposals[proposal.id] = proposal
        
        # Log session as draft
        log_ai_session(
            session_id=proposal.id,
            question=proposal.question,
            sql_code=proposal.code,
            explanation=proposal.explanation,
            status=ProposalStatus.DRAFT
        )
        
        return proposal
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Service translation failed: {e}")


@router.post("/proposals/{proposal_id}/approve", response_model=AnalysisProposal)
def approve_proposal(proposal_id: str, request: ApprovalRequest) -> AnalysisProposal:
    proposal = _get_proposal(proposal_id)
    # Validate SQL is read-only
    ensure_read_only_sql(request.code)
    
    updated = proposal.model_copy(update={"code": request.code, "status": ProposalStatus.APPROVED})
    _proposals[proposal_id] = updated
    
    # Log session as approved
    log_ai_session(
        session_id=proposal_id,
        question=updated.question,
        sql_code=updated.code,
        explanation=updated.explanation,
        status=ProposalStatus.APPROVED
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
        status=ProposalStatus.REJECTED
    )
    
    return updated


@router.post("/proposals/{proposal_id}/execute")
def execute_proposal(proposal_id: str) -> Dict[str, Any]:
    proposal = _get_proposal(proposal_id)
    
    if proposal.status != ProposalStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Only approved proposals can be executed")
        
    sql = proposal.code
    ensure_read_only_sql(sql)
    
    try:
        conn = get_db_connection()
        cursor = conn.execute(sql)
        cols = [desc[0] for desc in cursor.description]
        records = []
        for row in cursor.fetchall():
            d = dict(zip(cols, row))
            for k, v in d.items():
                if hasattr(v, 'strftime'):
                    d[k] = v.strftime('%Y-%m-%d')
            records.append(d)
        conn.close()
        
        row_count = len(records)
        
        # Mark as EXECUTED
        updated = proposal.model_copy(update={"status": ProposalStatus.EXECUTED})
        _proposals[proposal_id] = updated
        
        # Log session as executed
        log_ai_session(
            session_id=proposal_id,
            question=proposal.question,
            sql_code=sql,
            explanation=proposal.explanation,
            status=ProposalStatus.EXECUTED,
            row_count=row_count
        )
        
        return {
            "proposal_id": proposal_id,
            "status": "success",
            "row_count": row_count,
            "results": records
        }
    except Exception as e:
        # Log execution failure
        error_msg = str(e)
        log_ai_session(
            session_id=proposal_id,
            question=proposal.question,
            sql_code=sql,
            explanation=proposal.explanation,
            status="failed",
            error_message=error_msg
        )
        raise HTTPException(status_code=400, detail=f"SQL Execution error: {error_msg}")


def _get_proposal(proposal_id: str) -> AnalysisProposal:
    proposal = _proposals.get(proposal_id)
    if proposal is None:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal

