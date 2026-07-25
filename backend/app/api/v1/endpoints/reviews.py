from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.user import User
from app.crud.review import create_code_review
from app.schemas.review import (
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
    review_data: CodeReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_code_review(
        db=db,
        review_data=review_data,
        user_id=current_user.id
    )