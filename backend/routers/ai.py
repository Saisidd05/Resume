"""
AI Router — handles content generation and improvement via LLM.

All AI endpoints are OPTIONAL. If no API key is configured, endpoints
return a graceful error that the frontend uses to disable AI buttons.

Supports:
  - generate: create content from scratch
  - improve: improve existing text
  - shorten: make text more concise
  - professional_tone: rewrite in formal professional tone
"""
from __future__ import annotations

import logging
import os
from fastapi import APIRouter, HTTPException

from backend.models.schemas import AIRequest, AIResponse, AIAction, TemplateInstruction

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ai", tags=["ai"])

# ── Provider detection ─────────────────────────────────────────────────────────
_OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")
_ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY", "")
_AI_PROVIDER = os.getenv("AI_PROVIDER", "openai").lower()
_AI_MODEL = os.getenv("AI_MODEL", "gpt-4o-mini")
_AI_AVAILABLE = bool(_OPENAI_KEY or _ANTHROPIC_KEY)


def _build_system_prompt() -> str:
    return (
        "You are an expert resume writer. Your job is to help candidates write "
        "compelling, professional, and ATS-optimized resume content. "
        "Always write in first-person implicit style (no 'I' statements). "
        "Use strong action verbs. Be specific with metrics where possible. "
        "Match the tone and style of modern professional resumes."
    )


def _build_user_prompt(request: AIRequest) -> str:
    """Build the appropriate user prompt based on the AI action."""
    ctx = request.context
    job_title = request.job_title or ctx.get("job_title", "professional")
    years = request.years_experience or ctx.get("years_experience", "")
    section = request.section_name
    field = request.field_label

    # Build constraint context
    constraint_text = ""
    if request.constraints:
        c = request.constraints
        parts = []
        if c.min_lines and c.max_lines:
            parts.append(f"Write exactly {c.min_lines}–{c.max_lines} lines.")
        elif c.max_lines:
            parts.append(f"Maximum {c.max_lines} lines.")
        if c.min_bullets and c.max_bullets:
            parts.append(f"Use {c.min_bullets}–{c.max_bullets} bullet points.")
        elif c.max_bullets:
            parts.append(f"Use up to {c.max_bullets} bullet points.")
        if parts:
            constraint_text = " ".join(parts) + " "

    if request.action == AIAction.GENERATE:
        return (
            f"Generate content for the '{field}' field in the '{section}' section "
            f"of a resume for a {job_title}"
            f"{' with ' + years + ' of experience' if years else ''}. "
            f"{constraint_text}"
            f"Return ONLY the content, no explanations or extra text."
        )

    elif request.action == AIAction.IMPROVE:
        return (
            f"Improve the following '{field}' content for a {job_title}'s resume. "
            f"Make it more impactful, specific, and professional. "
            f"{constraint_text}"
            f"Return ONLY the improved content:\n\n{request.existing_text}"
        )

    elif request.action == AIAction.SHORTEN:
        return (
            f"Shorten the following resume content while preserving all key information. "
            f"Remove filler words, redundancies, and weak phrases. "
            f"{constraint_text}"
            f"Return ONLY the shortened version:\n\n{request.existing_text}"
        )

    elif request.action == AIAction.PROFESSIONAL_TONE:
        return (
            f"Rewrite the following text in a formal, professional tone suitable for "
            f"a {job_title}'s resume. Use strong action verbs. "
            f"{constraint_text}"
            f"Return ONLY the rewritten content:\n\n{request.existing_text}"
        )

    return f"Help with: {field} for {section} section."


async def _call_openai(system_prompt: str, user_prompt: str) -> str:
    """Call OpenAI API."""
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=_OPENAI_KEY)
        response = await client.chat.completions.create(
            model=_AI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=800,
            temperature=0.7,
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        raise RuntimeError(f"OpenAI API error: {e}")


async def _call_anthropic(system_prompt: str, user_prompt: str) -> str:
    """Call Anthropic Claude API."""
    try:
        import anthropic
        client = anthropic.AsyncAnthropic(api_key=_ANTHROPIC_KEY)
        message = await client.messages.create(
            model=_AI_MODEL if "claude" in _AI_MODEL else "claude-3-haiku-20240307",
            max_tokens=800,
            system=system_prompt,
            messages=[{"role": "user", "content": user_prompt}],
        )
        return message.content[0].text if message.content else ""
    except Exception as e:
        raise RuntimeError(f"Anthropic API error: {e}")


@router.get("/status")
async def ai_status():
    """Check if AI is configured and available."""
    return {
        "available": _AI_AVAILABLE,
        "provider": _AI_PROVIDER if _AI_AVAILABLE else None,
        "model": _AI_MODEL if _AI_AVAILABLE else None,
        "message": (
            "AI is ready" if _AI_AVAILABLE
            else "No AI API key configured. Add OPENAI_API_KEY or ANTHROPIC_API_KEY to .env.local to enable AI features."
        )
    }


@router.post("/suggest", response_model=AIResponse)
async def ai_suggest(request: AIRequest) -> AIResponse:
    """
    Generate or improve resume content using AI.
    Handles: generate, improve, shorten, professional_tone actions.
    """
    if not _AI_AVAILABLE:
        return AIResponse(
            success=False,
            error="AI is not configured. Add an API key to enable AI features."
        )

    try:
        system_prompt = _build_system_prompt()
        user_prompt = _build_user_prompt(request)

        if _AI_PROVIDER == "anthropic" and _ANTHROPIC_KEY:
            text = await _call_anthropic(system_prompt, user_prompt)
        else:
            text = await _call_openai(system_prompt, user_prompt)

        return AIResponse(success=True, generated_text=text.strip())

    except Exception as e:
        logger.exception(f"AI suggestion failed: {e}")
        return AIResponse(success=False, error=str(e))
