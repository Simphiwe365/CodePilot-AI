import json
import logging
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)


class AIReviewer:

    def __init__(self):
        self.groq_key = settings.GROQ_API_KEY
        self.openai_key = settings.OPENAI_API_KEY

        self.groq_client = None
        self.openai_client = None

        if self.groq_key:
            try:
                from groq import Groq
                self.groq_client = Groq(api_key=self.groq_key)
            except ImportError:
                # Fallback to OpenAI SDK pointed at Groq endpoint
                from openai import OpenAI
                self.groq_client = OpenAI(
                    api_key=self.groq_key,
                    base_url="https://api.groq.com/openai/v1"
                )

        if self.openai_key:
            from openai import OpenAI
            self.openai_client = OpenAI(api_key=self.openai_key)

    def review_code(self, code: str, language: str) -> str:
        """
        Submits code to LLM (Groq primary, OpenAI fallback, or Mock fallback)
        and returns a JSON-formatted code review string.
        """
        # Guard against excessively large inputs
        max_len = getattr(settings, "MAX_CODE_LENGTH", 50000)
        sanitized_code = code[:max_len] if len(code) > max_len else code
        sanitized_language = language[:50]

        system_prompt = (
            "You are CodePilot AI, a senior staff software engineer and security specialist.\n"
            "Analyze the submitted code and return ONLY valid JSON matching this exact structure:\n"
            "{\n"
            '  "summary": "High-level summary of the code and review findings",\n'
            '  "score": 85,\n'
            '  "severity": "medium",\n'
            '  "bugs": [{"title": "Bug title", "description": "...", "severity": "medium", "line_number": "10", "recommendation": "..."}],\n'
            '  "security_issues": [{"title": "Security vulnerability", "description": "...", "severity": "high", "recommendation": "..."}],\n'
            '  "performance_issues": [{"title": "Performance concern", "description": "...", "recommendation": "..."}],\n'
            '  "quality_issues": [{"title": "Code quality issue", "description": "...", "recommendation": "..."}],\n'
            '  "suggestions": ["Refactoring tip 1", "Tip 2"]\n'
            "}\n"
            "Ensure 'score' is an integer between 0 and 100.\n"
            "Ensure 'severity' is one of: 'low', 'medium', 'high', 'critical'.\n"
            "Do not include markdown code block formatting in your JSON output if possible."
        )

        user_prompt = f"Review this {sanitized_language} code:\n\n{sanitized_code}"

        # 1. Try Groq
        if self.groq_client:
            try:
                response = self.groq_client.chat.completions.create(
                    model=settings.GROQ_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.2,
                    timeout=25.0,
                    response_format={"type": "json_object"}
                )
                raw_json = response.choices[0].message.content
                return self._parse_and_validate_json(raw_json, sanitized_code, sanitized_language)
            except Exception as e:
                logger.warning(f"Groq API call failed: {e}. Trying fallbacks.")

        # 2. Try OpenAI
        if self.openai_client:
            try:
                response = self.openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.2,
                    timeout=25.0
                )
                raw_json = response.choices[0].message.content
                return self._parse_and_validate_json(raw_json, sanitized_code, sanitized_language)
            except Exception as e:
                logger.warning(f"OpenAI API call failed: {e}. Falling back to mock review.")

        # 3. Mock fallback when no key is set or APIs fail
        return self._generate_mock_review(sanitized_code, sanitized_language)

    def _parse_and_validate_json(self, raw_text: str, code: str, language: str) -> str:
        """Parses raw text into sanitized JSON string, guaranteeing expected fields."""
        cleaned = raw_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            parsed = json.loads(cleaned)
            # Ensure defaults for required fields
            parsed.setdefault("summary", f"Automated {language} code review completed.")
            parsed.setdefault("score", 80)
            parsed.setdefault("severity", "medium")
            parsed.setdefault("bugs", [])
            parsed.setdefault("security_issues", [])
            parsed.setdefault("performance_issues", [])
            parsed.setdefault("quality_issues", [])
            parsed.setdefault("suggestions", [])
            return json.dumps(parsed, indent=2)
        except Exception:
            # If AI returned non-JSON format, encapsulate it
            fallback_payload = {
                "summary": cleaned[:300] if cleaned else "Code review complete.",
                "score": 75,
                "severity": "medium",
                "bugs": [],
                "security_issues": [],
                "performance_issues": [],
                "quality_issues": [{"title": "Unstructured Feedback", "description": cleaned, "recommendation": "Review feedback"}],
                "suggestions": ["Consider adding unit tests", "Ensure input parameters are validated"]
            }
            return json.dumps(fallback_payload, indent=2)

    def _generate_mock_review(self, code: str, language: str) -> str:
        """Generates static/heuristic mock review when API key is missing."""
        has_division = "/" in code
        has_eval = "eval(" in code or "exec(" in code
        has_hardcoded_pass = "password" in code.lower() and "=" in code

        bugs = []
        security_issues = []
        performance_issues = []
        quality_issues = []
        suggestions = [
            f"Add type annotations for all {language} functions",
            "Write unit tests to cover edge cases"
        ]

        score = 85
        severity = "low"

        if has_division:
            bugs.append({
                "title": "Potential Zero Division",
                "description": "Division operation detected without zero-check on the denominator.",
                "severity": "medium",
                "recommendation": "Validate that denominator is not zero prior to division."
            })
            score -= 10
            severity = "medium"

        if has_eval:
            security_issues.append({
                "title": "Arbitrary Code Execution Risk",
                "description": "Dynamic execution primitive (eval/exec) detected.",
                "severity": "critical",
                "recommendation": "Remove eval/exec calls and use safer parser alternatives."
            })
            score -= 30
            severity = "critical"

        if has_hardcoded_pass:
            security_issues.append({
                "title": "Hardcoded Secret / Password",
                "description": "Found string variable that appears to store a cleartext secret.",
                "severity": "high",
                "recommendation": "Load sensitive credentials via environment variables."
            })
            score -= 20
            if severity not in ["critical"]:
                severity = "high"

        if len(code.splitlines()) > 50:
            quality_issues.append({
                "title": "Large Function / Script",
                "description": f"The {language} code snippet is long ({len(code.splitlines())} lines).",
                "recommendation": "Decompose monolithic functions into small single-responsibility helpers."
            })

        mock_payload = {
            "summary": f"Initial analysis of {language} code completed (Mock Mode — add GROQ_API_KEY in .env for live AI reviews).",
            "score": max(score, 10),
            "severity": severity,
            "bugs": bugs,
            "security_issues": security_issues,
            "performance_issues": performance_issues,
            "quality_issues": quality_issues,
            "suggestions": suggestions
        }

        return json.dumps(mock_payload, indent=2)