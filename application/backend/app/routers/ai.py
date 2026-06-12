from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.models.ai import AnalysisProposal, AnalysisRequest, ApprovalRequest, ProposalStatus
from app.services.sql_guard import ensure_read_only_sql

router = APIRouter()
_proposals: dict[str, AnalysisProposal] = {}


@router.post("/proposals", response_model=AnalysisProposal)
def create_proposal(request: AnalysisRequest) -> AnalysisProposal:
    proposal = AnalysisProposal(
        id=str(uuid4()),
        question=request.question,
        code="SELECT location, AVG(temperature_2m_mean) AS avg_temperature "
        "FROM climate_daily GROUP BY location ORDER BY avg_temperature DESC",
        explanation=(
            "Bản nháp minh họa: tính nhiệt độ trung bình theo địa điểm. "
            "Cần thay bằng code do mô hình AI sinh sau khi tích hợp nhà cung cấp."
        ),
    )
    _proposals[proposal.id] = proposal
    return proposal


@router.post("/proposals/{proposal_id}/approve", response_model=AnalysisProposal)
def approve_proposal(proposal_id: str, request: ApprovalRequest) -> AnalysisProposal:
    proposal = _get_proposal(proposal_id)
    ensure_read_only_sql(request.code)
    updated = proposal.model_copy(update={"code": request.code, "status": ProposalStatus.APPROVED})
    _proposals[proposal_id] = updated
    return updated


@router.post("/proposals/{proposal_id}/reject", response_model=AnalysisProposal)
def reject_proposal(proposal_id: str) -> AnalysisProposal:
    proposal = _get_proposal(proposal_id)
    updated = proposal.model_copy(update={"status": ProposalStatus.REJECTED})
    _proposals[proposal_id] = updated
    return updated


def _get_proposal(proposal_id: str) -> AnalysisProposal:
    proposal = _proposals.get(proposal_id)
    if proposal is None:
        raise HTTPException(status_code=404, detail="Proposal not found")
    return proposal

