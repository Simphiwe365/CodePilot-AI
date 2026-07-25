from datetime import datetime

from pydantic import BaseModel


class CodeReviewCreate(BaseModel):
    language: str
    code: str


class CodeReviewResponse(BaseModel):
    id: int
    language: str
    code: str
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }