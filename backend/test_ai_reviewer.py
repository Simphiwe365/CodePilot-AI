from app.services.ai_reviewer import AIReviewer


reviewer = AIReviewer()

result = reviewer.review_code(
    code="""
def divide(a, b):
    return a / b
""",
    language="python"
)

print(result)