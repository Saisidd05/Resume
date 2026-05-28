"""
Generate Router — fills the template with user answers.
POST /api/generate  →  returns base64-encoded output file (PDF or DOCX)
"""
from __future__ import annotations

import logging
from fastapi import APIRouter, HTTPException

from backend.models.schemas import GenerationRequest, GenerationResult
from backend.engines.generator import generate_resume

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["generate"])


@router.post("/generate", response_model=GenerationResult)
async def generate_resume_endpoint(request: GenerationRequest) -> GenerationResult:
    """
    Fill the original template with user-provided answers.
    Returns the output as a base64-encoded file.
    The output is visually identical to the input template.
    """
    if not request.original_file_b64:
        raise HTTPException(status_code=400, detail="No template file provided.")

    if not request.answers.answers:
        raise HTTPException(status_code=400, detail="No answers provided.")

    try:
        result = generate_resume(request)
    except Exception as e:
        logger.exception(f"Generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

    if not result.success:
        # Return 200 with error details so client can show warnings
        logger.warning(f"Generation completed with errors: {result.errors}")

    return result
