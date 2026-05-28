"""
Parse Router — handles template file upload and parsing.
POST /api/parse  →  returns ParsedTemplate + QuestionFlow
"""
from __future__ import annotations

import logging
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse

from backend.models.schemas import FileType, ParsedTemplate, QuestionFlow
from backend.parsers.pdf_parser import parse_pdf
from backend.parsers.docx_parser import parse_docx
from backend.engines.question_engine import generate_question_flow

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["parse"])

ALLOWED_TYPES = {
    "application/pdf": FileType.PDF,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": FileType.DOCX,
    "application/msword": FileType.DOCX,
}
MAX_FILE_SIZE_MB = 20


@router.post("/parse")
async def parse_template(file: UploadFile = File(...)):
    """
    Upload a resume template (PDF or DOCX) and receive:
    - parsed_template: full structure with sections, placeholders, instructions
    - question_flow: dynamically generated question cards
    """
    # ── Validate file type ────────────────────────────────────────────────────
    content_type = file.content_type or ""
    filename = file.filename or "resume_template"
    ext = filename.rsplit('.', 1)[-1].lower()

    file_type: FileType | None = None

    if content_type in ALLOWED_TYPES:
        file_type = ALLOWED_TYPES[content_type]
    elif ext == "pdf":
        file_type = FileType.PDF
    elif ext in ("docx", "doc"):
        file_type = FileType.DOCX

    if file_type is None:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {content_type}. Please upload a PDF or DOCX file."
        )

    # ── Read and size-check ───────────────────────────────────────────────────
    file_bytes = await file.read()
    size_mb = len(file_bytes) / (1024 * 1024)

    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Maximum allowed: {MAX_FILE_SIZE_MB} MB."
        )

    if len(file_bytes) < 100:
        raise HTTPException(status_code=400, detail="File appears to be empty or corrupted.")

    # ── Parse ─────────────────────────────────────────────────────────────────
    try:
        if file_type == FileType.PDF:
            parsed_template = parse_pdf(file_bytes, filename)
        else:
            parsed_template = parse_docx(file_bytes, filename)
    except Exception as e:
        logger.exception(f"Failed to parse template: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse template: {str(e)}"
        )

    # ── Generate question flow ─────────────────────────────────────────────────
    try:
        question_flow = generate_question_flow(parsed_template)
    except Exception as e:
        logger.exception(f"Failed to generate question flow: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate questions: {str(e)}"
        )

    logger.info(
        f"Parsed template '{filename}': {len(parsed_template.sections)} sections, "
        f"{len(parsed_template.all_placeholders)} placeholders, "
        f"{len(question_flow.cards)} question cards"
    )

    return {
        "parsed_template": parsed_template.model_dump(),
        "question_flow": question_flow.model_dump(),
        "summary": {
            "file_type": file_type,
            "sections_found": len(parsed_template.sections),
            "placeholders_found": len(parsed_template.all_placeholders),
            "instructions_found": len(parsed_template.all_instructions),
            "question_cards": len(question_flow.cards),
        }
    }
