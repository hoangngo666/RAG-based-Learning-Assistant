import json
from collections.abc import AsyncIterator
from typing import Any

from google import genai

from app.config import get_settings


class GenerationConfigError(Exception):
    """Raised when the Gemini API is not configured correctly."""


def _get_client() -> genai.Client:
    """Create a Gemini client using the API key from environment settings."""
    settings = get_settings()
    api_key = settings.gemini_api_key

    if not api_key:
        raise GenerationConfigError(
            "GEMINI_API_KEY is missing. Please configure it in your .env file."
        )

    return genai.Client(api_key=api_key)


def _get_model() -> str:
    """Get the Gemini model name from settings."""
    settings = get_settings()
    model = settings.gemini_model

    if not model:
        raise GenerationConfigError(
            "GEMINI_MODEL is missing. Please configure it in your .env file."
        )

    return model


def _format_sources(sources: list[Any]) -> str:
    """Convert retrieved sources into text for the Gemini prompt."""
    formatted_sources = []

    for index, source in enumerate(sources, start=1):
        if isinstance(source, dict):
            content = (
                source.get("content")
                or source.get("text")
                or source.get("chunk_text")
                or ""
            )
            title = source.get("title") or source.get("document_title") or "Unknown"
        else:
            content = (
                getattr(source, "content", None)
                or getattr(source, "text", None)
                or getattr(source, "chunk_text", None)
                or ""
            )
            title = (
                getattr(source, "title", None)
                or getattr(source, "document_title", None)
                or "Unknown"
            )

        formatted_sources.append(
            f"[Source {index}]\n"
            f"Title: {title}\n"
            f"Content:\n{content}"
        )

    return "\n\n".join(formatted_sources)


async def _generate_text(prompt: str) -> str:
    """Generate text using Gemini."""
    client = _get_client()
    model = _get_model()

    try:
        async with client.aio as async_client:
            response = await async_client.models.generate_content(
                model=model,
                contents=prompt,
            )

        return response.text or ""

    except GenerationConfigError:
        raise
    except Exception as exc:
        raise RuntimeError(f"Gemini generation failed: {exc}") from exc


async def stream_answer(
    question: str,
    citations: list[Any],
    recent_messages: list[Any] | None = None,
) -> AsyncIterator[str]:
    """Generate a streaming answer for the chat endpoint."""
    client = _get_client()
    model = _get_model()

    context = _format_sources(citations)

    history = ""
    if recent_messages:
        history_items = []

        for message in recent_messages:
            if isinstance(message, dict):
                role = message.get("role", "user")
                content = message.get("content", "")
            else:
                role = getattr(message, "role", "user")
                content = getattr(message, "content", "")

            if content:
                history_items.append(f"{role}: {content}")

        history = "\n".join(history_items)

    prompt = f"""
You are an AI learning assistant.

Your task is to answer the user's question based on the provided sources.

Rules:
- Use the provided context as the primary source of information.
- If the context does not contain enough information, clearly say so.
- Do not invent facts or information.
- Answer clearly and concisely.
- Respond in the same language as the user's question.
- When using information from a source, cite it using [Source 1], [Source 2], etc.
- Use conversation history only to understand the user's follow-up questions.

Conversation history:
{history or "No previous messages."}

Retrieved sources:
{context or "No relevant sources were found."}

User question:
{question}

Answer:
"""

    try:
        async with client.aio as async_client:
            stream = await async_client.models.generate_content_stream(
                model=model,
                contents=prompt,
            )

            async for chunk in stream:
                if chunk.text:
                    yield chunk.text

    except GenerationConfigError:
        raise
    except Exception as exc:
        raise RuntimeError(f"Gemini streaming failed: {exc}") from exc


async def generate_summary(sources: list[Any]) -> str:
    """Generate a summary from retrieved study sources."""
    context = _format_sources(sources)

    if not context:
        return "Không tìm thấy tài liệu phù hợp để tạo bản tóm tắt."

    prompt = f"""
You are an AI learning assistant.

Summarize the following study materials.

Requirements:
- Use only the information in the provided materials.
- Preserve important concepts, definitions, and facts.
- Organize the summary with clear headings and bullet points.
- Do not invent information.
- Respond in Vietnamese.

Study materials:
{context}

Summary:
"""

    return await _generate_text(prompt)


async def generate_flashcard_notes(sources: list[Any]) -> str:
    """Generate study notes from sources for flashcard creation."""
    context = _format_sources(sources)

    if not context:
        return "Không tìm thấy tài liệu phù hợp để tạo ghi chú."

    prompt = f"""
You are an AI learning assistant.

Create concise study notes from the following materials.
These notes will be used to generate flashcards later.

Requirements:
- Include key concepts, definitions, and important facts.
- Organize the notes into clear sections.
- Keep the information accurate and concise.
- Use only the provided materials.
- Do not invent information.
- Respond in Vietnamese.

Study materials:
{context}

Study notes:
"""

    return await _generate_text(prompt)


async def generate_flashcards_from_notes(
    notes_context: str,
    flashcard_count: int,
    coverage_hint: str | None = None,
) -> str:
    """Generate flashcards from study notes."""
    if not notes_context.strip():
        return "[]"

    if flashcard_count <= 0:
        raise ValueError("flashcard_count must be greater than 0.")

    coverage = coverage_hint or "Cover the most important concepts."

    prompt = f"""
You are an AI learning assistant.

Create exactly {flashcard_count} flashcards based on the study notes.

Requirements:
- Each flashcard must contain a question and an answer.
- Questions should test understanding of the material.
- Answers should be accurate and concise.
- Use only the provided notes.
- Do not invent information.
- Follow this coverage instruction: {coverage}
- Respond in Vietnamese.
- Return valid JSON only.
- Do not include Markdown code fences or extra explanations.

Use this JSON format:
[
  {{
    "question": "Question text",
    "answer": "Answer text"
  }}
]

Study notes:
{notes_context}

Flashcards:
"""

    response = await _generate_text(prompt)

    # Remove Markdown code fences if Gemini includes them.
    cleaned_response = response.strip()
    if cleaned_response.startswith("```"):
        cleaned_response = cleaned_response.split("\n", 1)[-1]
        if cleaned_response.endswith("```"):
            cleaned_response = cleaned_response[:-3].strip()

    # Validate that Gemini returned valid JSON.
    try:
        flashcards = json.loads(cleaned_response)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "Gemini returned invalid JSON while generating flashcards."
        ) from exc

    if not isinstance(flashcards, list):
        raise RuntimeError("Gemini did not return a JSON list of flashcards.")

    return json.dumps(flashcards, ensure_ascii=False)