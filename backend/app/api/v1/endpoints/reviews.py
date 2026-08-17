from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.db.dependencies import get_db
from app.models.user import User

from app.crud.review import (
    create_code_review,
    delete_review_by_id,
    get_review_by_id,
    get_user_review_stats,
    get_user_reviews
)

from app.schemas.review import (
    CodeReviewCreate,
    CodeReviewResponse,
    ReviewStatsResponse
)

from app.services.ai_reviewer import AIReviewer


router = APIRouter(
    prefix="/reviews",
    tags=["Code Reviews"]
)


@router.get(
    "/stats",
    response_model=ReviewStatsResponse
)
def get_reviews_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get code review statistics for the logged-in user.
    """
    return get_user_review_stats(db=db, user_id=current_user.id)


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
    """
    Submit source code for AI review.
    """
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
    skip: int = Query(0, ge=0, description="Number of reviews to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of reviews to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all code reviews belonging to the current user.
    """
    return get_user_reviews(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit
    )


@router.get(
    "/{review_id}",
    response_model=CodeReviewResponse
)
def get_single_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a specific code review owned by the current user.
    """
    review = get_review_by_id(db=db, review_id=review_id, user_id=current_user.id)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Code review not found or access unauthorized."
        )
    return review


@router.delete(
    "/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_single_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a code review owned by the current user.
    """
    deleted = delete_review_by_id(db=db, review_id=review_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Code review not found or access unauthorized."
        )
    return None