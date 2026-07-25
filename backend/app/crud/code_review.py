from sqlalchemy.orm import Session

from app.models.code_review import CodeReview
from app.schemas.code_review import CodeReviewCreate


def create_code_review(
    db: Session,
    review: CodeReviewCreate,
    user_id: int
):
    db_review = CodeReview(
        user_id=user_id,
        language=review.language,
        code=review.code,
        status="pending"
    )

    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    return db_review