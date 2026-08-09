from datetime import datetime, timezone

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class CodeReview(Base):
    __tablename__ = "code_reviews"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    language: Mapped[str] = mapped_column(
        String(50)
    )

    code: Mapped[str] = mapped_column(
        Text
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="pending"
    )

    review_result: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="code_reviews"
    )