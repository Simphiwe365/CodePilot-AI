from fastapi import FastAPI

app = FastAPI(
    title="CodePilot AI",
    description="AI-powered code review platform",
    version="0.1.0"
)


@app.get("/")
def root():
    return {
        "message": "Welcome to CodePilot AI - AI-powered code review platform"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }