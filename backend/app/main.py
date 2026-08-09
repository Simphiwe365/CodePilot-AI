from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.reviews import router as reviews_router

from app.db.database import Base, engine

# Import models so SQLAlchemy knows about all tables
from app.models.user import User
from app.models.code_review import CodeReview


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="CodePilot AI",
    description="AI-powered code review platform",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(reviews_router)


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