from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field

AnalysisKind = Literal["sql", "python"]


class ProposalStatus(StrEnum):
    DRAFT = "draft"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXECUTED = "executed"


class AnalysisRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1000)
    kind: AnalysisKind = "sql"


class ChartSpec(BaseModel):
    type: Literal["bar", "line", "pie", "scatter"] = "bar"
    x: str
    y: str


class AnalysisProposal(BaseModel):
    id: str
    question: str
    code: str
    explanation: str
    kind: AnalysisKind = "sql"
    chart: ChartSpec | None = None
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
    kind: str = "sql"
    status: str
    error_message: str | None = None
    row_count: int | None = None

