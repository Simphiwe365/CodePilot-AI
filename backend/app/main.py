from fastapi import FastAPI
from sqlalchemy import text

from app.api.v1.endpoints.auth import router as auth_router
from app.db.database import Base, engine

# Import models
from app.models.user import User

app = FastAPI(
    title="CodePilot AI",
    description="AI-powered code review platform",
    version="0.1.0"
)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to CodePilot AI",
        "name": "CodePilot AI",
        "version": "0.1.0",
        "author": "Simphiwe Mbatha"
    }


@app.get("/health")
def health():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": str(e)
        }