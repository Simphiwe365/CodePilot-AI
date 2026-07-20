from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.schemas.user import UserCreate, UserResponse
from app.crud.user import create_user, get_user_by_email

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing = get_user_by_email(db, user.email)

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    return create_user(db, user)

