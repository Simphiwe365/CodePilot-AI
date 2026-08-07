from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.user import User

from app.crud.review import (
    create_code_review,
    get_user_reviews
)

from app.schemas.review import (
    CodeReviewCreate,
    CodeReviewResponse
)

from app.services.ai_reviewer import AIReviewer


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

    # Save review first
    review = create_code_review(
        db=db,
        review_data=review_data,
        user_id=current_user.id
    )

    ai_reviewer = AIReviewer()

    try:
        # Generate AI review
        result = ai_reviewer.review_code(
            code=review_data.code,
            language=review_data.language
        )

        review.review_result = result
        review.status = "completed"

    except Exception as e:

        review.review_result = f"AI Review Failed: {str(e)}"
        review.status = "failed"

    db.commit()
    db.refresh(review)

    return review


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