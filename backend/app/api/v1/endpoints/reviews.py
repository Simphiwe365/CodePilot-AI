from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.crud.review import (
    create_code_review,
    get_user_reviews
)
from app.db.dependencies import get_db
from app.models.user import User
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


@router.get(
    "/",
    response_model=list[CodeReviewResponse]
)
def get_my_reviews(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_user_reviews(
        db=db,
        user_id=current_user.id
    )