from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.crud.code_review import create_code_review
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.code_review import (
    CodeReviewCreate,
    CodeReviewResponse
)


router = APIRouter(
    prefix="/reviews",
    tags=["Code Reviews"]
)


@router.post(
    "/",
    response_model=CodeReviewResponse,
    status_code=status.HTTP_201_CREATED
)
def submit_code_review(
    review: CodeReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return create_code_review(
        db=db,
        review=review,
        user_id=current_user.id
    )