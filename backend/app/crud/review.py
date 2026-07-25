from sqlalchemy.orm import Session

from app.models.code_review import CodeReview
from app.schemas.review import CodeReviewCreate


def create_code_review(
    db: Session,
    review_data: CodeReviewCreate,
    user_id: int
):
    review = CodeReview(
        user_id=user_id,
        language=review_data.language,
        code=review_data.code,
        status="pending"
    )

    db.add(review)
    db.commit()
    db.refresh(review)

    return review