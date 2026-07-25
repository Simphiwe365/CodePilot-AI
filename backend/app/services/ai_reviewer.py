from openai import OpenAI

from app.core.config import settings


class AIReviewer:

    def __init__(self):
        self.client = OpenAI(
            api_key=settings.OPENAI_API_KEY
        )

    def review_code(
        self,
        code: str,
        language: str
    ) -> str:

        prompt = f"""
        You are an expert software engineer and security reviewer.

        Review the following {language} code.

        Analyze it for:

        1. Bugs
        2. Security vulnerabilities
        3. Performance problems
        4. Code quality issues
        5. Improvement suggestions

        Provide a clear and practical code review.

        Code:

        {code}
        """

        response = self.client.responses.create(
            model="gpt-4.1-mini",
            input=prompt
        )

        return response.output_text