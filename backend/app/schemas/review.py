from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CodeReviewCreate(BaseModel):
    language: str
    code: str


class CodeReviewResponse(BaseModel):
    id: int
    language: str
    code: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)