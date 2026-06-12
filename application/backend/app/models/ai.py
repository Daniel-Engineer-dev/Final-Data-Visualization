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

