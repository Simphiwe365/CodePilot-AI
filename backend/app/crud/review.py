from sqlalchemy.orm import Session

from app.models.code_review import CodeReview
from app.schemas.review import CodeReviewCreate


def create_code_review(
    db: Session,
    review_data: CodeReviewCreate,
    user_id: int
) -> CodeReview:

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


def get_user_reviews(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 50
) -> list[CodeReview]:

    return (
        db.query(CodeReview)
        .filter(CodeReview.user_id == user_id)
        .order_by(CodeReview.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_review_by_id(
    db: Session,
    review_id: int,
    user_id: int
) -> CodeReview | None:
    """
    Fetches a single review by ID strictly ensuring it belongs to user_id.
    """
    return (
        db.query(CodeReview)
        .filter(
            CodeReview.id == review_id,
            CodeReview.user_id == user_id
        )
        .first()
    )


def delete_review_by_id(
    db: Session,
    review_id: int,
    user_id: int
) -> bool:
    """
    Deletes a review by ID strictly ensuring ownership.
    Returns True if deleted, False if not found or unauthorized.
    """
    review = get_review_by_id(db, review_id=review_id, user_id=user_id)
    if not review:
        return False

    db.delete(review)
    db.commit()
    return True


def get_user_review_stats(
    db: Session,
    user_id: int
) -> dict:
    """
    Aggregates code review statistics for a specific user.
    """
    reviews = db.query(CodeReview).filter(CodeReview.user_id == user_id).all()

    total_reviews = len(reviews)
    completed = sum(1 for r in reviews if r.status == "completed")
    failed = sum(1 for r in reviews if r.status == "failed")
    pending = sum(1 for r in reviews if r.status == "pending")

    languages: dict[str, int] = {}
    for r in reviews:
        lang = r.language.lower() if r.language else "unknown"
        languages[lang] = languages.get(lang, 0) + 1

    return {
        "total_reviews": total_reviews,
        "completed": completed,
        "failed": failed,
        "pending": pending,
        "languages": languages
    }