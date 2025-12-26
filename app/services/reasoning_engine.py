import json
from typing import Any, Dict, Optional

from openai import OpenAI

from app.core.config import settings

PROMPT_TEMPLATE = (
    "You are an expert Technical Recruiter. "
    "Job Description: {job_description}\n"
    "Candidate Resume Snippet: {candidate_profile}\n\n"
    "Task:\n"
    "Assign a Match Score (0-100).\n"
    "Provide a 'Chain of Thought' explanation: Why does this candidate fit?"
    " (e.g., 'Candidate lacks \"Django\" keyword but has \"Flask\" and 5 years Python, which implies capability').\n"
    "Highlight 'Green Flags' (Strong semantic matches) and 'Red Flags' (Missing critical hard skills).\n"
    "Return the response in strictly valid JSON format."
)


def analyze_match(
    candidate_profile: str,
    job_description: str,
    *,
    client: Optional[OpenAI] = None,
    model: Optional[str] = None,
) -> Dict[str, Any]:
    """Call the LLM to generate a match analysis with chain-of-thought output."""

    prompt = PROMPT_TEMPLATE.format(
        job_description=job_description.strip(),
        candidate_profile=candidate_profile.strip(),
    )

    if settings.llm_provider.lower() == "gemini":
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is required when llm_provider is gemini.")

        from google import genai

        llm_client = genai.Client(api_key=settings.gemini_api_key)
        model_name = model or settings.gemini_model

        completion = llm_client.models.generate_content(
            model=model_name,
            contents=prompt,
        )
        content = completion.text or "{}"
        return json.loads(content)

    llm_client = client or OpenAI(api_key=settings.openai_api_key)
    model_name = model or settings.llm_model

    completion = llm_client.chat.completions.create(
        model=model_name,
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": "Provide transparent reasoning and follow JSON instructions precisely.",
            },
            {"role": "user", "content": prompt},
        ],
    )

    content = completion.choices[0].message.content or "{}"
    return json.loads(content)
