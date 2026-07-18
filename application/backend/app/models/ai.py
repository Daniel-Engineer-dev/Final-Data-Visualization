from enum import StrEnum

from pydantic import BaseModel, Field


class ProposalStatus(StrEnum):
    DRAFT = "draft"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXECUTED = "executed"


class AnalysisRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1000)


class AnalysisProposal(BaseModel):
    id: str
    question: str
    code: str
    explanation: str
    status: ProposalStatus = ProposalStatus.DRAFT


class ApprovalRequest(BaseModel):
    code: str = Field(min_length=1)


class AILogEntry(BaseModel):
    id: int
    session_id: str
    timestamp: str
    question: str
    sql_code: str
    explanation: str
    status: str
    error_message: str | None = None
    row_count: int | None = None

