"""
Default Template Router — serves the pre-bundled resume template.

GET /api/default-template  →  returns ParsedTemplate + QuestionFlow
for the bundled Resume_Template_-1.pdf without any file upload.
"""
from __future__ import annotations

import logging
import os
from pathlib import Path
from fastapi import APIRouter, HTTPException

from backend.parsers.pdf_parser import parse_pdf
from backend.engines.default_question_flow import build_default_question_flow

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["default-template"])

# Path to the bundled template — resolve relative to project root
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_TEMPLATE_PATH = _PROJECT_ROOT / "Resume_Template_-1.pdf"


@router.get("/default-template")
async def get_default_template():
    """
    Parse the pre-bundled resume template and return the question flow.
    No file upload required — the template is bundled with the server.
    """
    if not _DEFAULT_TEMPLATE_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail=(
                f"Default template not found at {_DEFAULT_TEMPLATE_PATH}. "
                "Please ensure Resume_Template_-1.pdf is in the project root."
            )
        )

    try:
        file_bytes = _DEFAULT_TEMPLATE_PATH.read_bytes()
        filename = _DEFAULT_TEMPLATE_PATH.name
    except Exception as e:
        logger.exception(f"Failed to read default template: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read default template: {str(e)}"
        )

    try:
        parsed_template = parse_pdf(file_bytes, filename)
    except Exception as e:
        logger.exception(f"Failed to parse default template: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse template: {str(e)}"
        )

    try:
        question_flow = build_default_question_flow()
    except Exception as e:
        logger.exception(f"Failed to generate question flow: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate questions: {str(e)}"
        )

    logger.info(
        f"Served default template '{filename}': "
        f"{len(parsed_template.sections)} sections, "
        f"{len(parsed_template.all_placeholders)} placeholders, "
        f"{len(question_flow.cards)} question cards"
    )

    return {
        "parsed_template": parsed_template.model_dump(),
        "question_flow": question_flow.model_dump(),
        "summary": {
            "file_type": "pdf",
            "sections_found": len(parsed_template.sections),
            "placeholders_found": len(parsed_template.all_placeholders),
            "instructions_found": len(parsed_template.all_instructions),
            "question_cards": len(question_flow.cards),
        },
    }
