from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class CodeReviewCreate(BaseModel):
    language: str = Field(..., description="Programming language of the code snippet")
    code: str = Field(..., description="Source code to be reviewed")


class BugItem(BaseModel):
    title: str
    description: str
    severity: str = "medium"
    line_number: str | None = None
    recommendation: str | None = None


class SecurityItem(BaseModel):
    title: str
    description: str
    severity: str = "high"
    cve_or_type: str | None = None
    recommendation: str | None = None


class StructuredReviewDetail(BaseModel):
    summary: str
    score: int = Field(..., ge=0, le=100, description="Overall quality score 0-100")
    severity: str = Field("medium", description="Overall severity rating: low, medium, high, critical")
    bugs: list[dict[str, Any]] = []
    security_issues: list[dict[str, Any]] = []
    performance_issues: list[dict[str, Any]] = []
    quality_issues: list[dict[str, Any]] = []
    suggestions: list[str] = []


class CodeReviewResponse(BaseModel):
    id: int
    user_id: int
    language: str
    code: str
    status: str
    review_result: str | None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class ReviewStatsResponse(BaseModel):
    total_reviews: int
    completed: int
    failed: int
    pending: int
    languages: dict[str, int]