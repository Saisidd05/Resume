"""
Pydantic schemas for At Your Hand — Template-Preserving Resume Builder.
All data models for parsing, template intelligence, questions, and generation.
"""
from __future__ import annotations
from typing import Any, Optional
from pydantic import BaseModel, Field
from enum import Enum


# ─────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────

class FileType(str, Enum):
    PDF = "pdf"
    DOCX = "docx"


class QuestionType(str, Enum):
    TEXT = "text"
    TEXTAREA = "textarea"
    LIST = "list"          # bullet list of items
    MULTIFIELD = "multifield"  # e.g., company + role + dates


class AIAction(str, Enum):
    GENERATE = "generate"
    IMPROVE = "improve"
    SHORTEN = "shorten"
    PROFESSIONAL_TONE = "professional_tone"


# ─────────────────────────────────────────────
# Font & Layout Metadata
# ─────────────────────────────────────────────

class FontInfo(BaseModel):
    name: str = "Unknown"
    size: float = 12.0
    bold: bool = False
    italic: bool = False
    color: Optional[str] = None  # hex color


class BoundingBox(BaseModel):
    """Coordinates on the PDF page (points from top-left)."""
    x0: float
    y0: float
    x1: float
    y1: float
    page: int = 0


# ─────────────────────────────────────────────
# Template Parsing — Core Structures
# ─────────────────────────────────────────────

class TemplateInstruction(BaseModel):
    """
    A written instruction found inside the template text.
    E.g., "Executive Summary: 3–4 lines", "5–10 bullet points"
    """
    raw_text: str                          # Original instruction text
    section: str                           # Which section it belongs to
    min_lines: Optional[int] = None
    max_lines: Optional[int] = None
    min_bullets: Optional[int] = None
    max_bullets: Optional[int] = None
    min_words: Optional[int] = None
    max_words: Optional[int] = None
    custom_note: Optional[str] = None      # Any free-form constraint


class Placeholder(BaseModel):
    """
    A single fillable placeholder region in the template.
    For PDF: defined by bounding box + font info.
    For DOCX: defined by paragraph/run index + style info.
    """
    id: str                                # Unique ID e.g. "name_0"
    label: str                             # Human-readable label e.g. "Full Name"
    section: str                           # Parent section
    original_text: str                     # The placeholder text as it appears
    font: FontInfo
    bbox: Optional[BoundingBox] = None     # PDF only
    paragraph_index: Optional[int] = None  # DOCX only
    run_index: Optional[int] = None        # DOCX only
    is_bullet: bool = False
    is_heading: bool = False


class Section(BaseModel):
    """A logical section of the resume (e.g., Experience, Education)."""
    id: str
    name: str                              # e.g., "Experience"
    order: int                             # Position in document
    heading_text: str                      # Exact heading as in template
    heading_font: FontInfo
    placeholders: list[Placeholder] = []
    instructions: list[TemplateInstruction] = []
    raw_content: str = ""                  # Raw text of entire section


class ParsedTemplate(BaseModel):
    """Full result of parsing an uploaded template file."""
    file_type: FileType
    original_filename: str
    page_count: int = 1
    sections: list[Section] = []
    all_instructions: list[TemplateInstruction] = []
    all_placeholders: list[Placeholder] = []
    # For PDF: stores the original bytes as base64 for the generator to use
    original_file_b64: Optional[str] = None
    # Metadata about the document's overall layout
    page_width: Optional[float] = None    # PDF page width in points
    page_height: Optional[float] = None  # PDF page height in points
    default_font: FontInfo = Field(default_factory=FontInfo)


# ─────────────────────────────────────────────
# Question Engine
# ─────────────────────────────────────────────

class QuestionField(BaseModel):
    """A single input field within a question card."""
    id: str                                # Unique field ID
    label: str                             # Display label
    placeholder_hint: str = ""            # Hint text
    question_type: QuestionType = QuestionType.TEXTAREA
    linked_placeholder_id: Optional[str] = None  # Links to Placeholder.id
    required: bool = True
    constraints: Optional[TemplateInstruction] = None
    ai_context: str = ""                   # Context sent to AI for this field


class QuestionCard(BaseModel):
    """A card representing one section's questions."""
    section_id: str
    section_name: str
    section_order: int
    fields: list[QuestionField] = []
    description: str = ""                  # Shown above the question card


class QuestionFlow(BaseModel):
    """The complete ordered question flow for a parsed template."""
    cards: list[QuestionCard] = []
    total_sections: int = 0


# ─────────────────────────────────────────────
# Answer & Generation
# ─────────────────────────────────────────────

class FieldAnswer(BaseModel):
    """A single answered field."""
    field_id: str
    section_id: str
    value: str                             # The answer text
    is_ai_generated: bool = False


class AnswerSet(BaseModel):
    """All answers for a complete resume."""
    answers: list[FieldAnswer] = []


class GenerationRequest(BaseModel):
    """Request payload to the generator endpoint."""
    original_file_b64: str                 # Base64-encoded original template file
    file_type: FileType
    original_filename: str
    parsed_template: ParsedTemplate
    answers: AnswerSet
    strict_mode: bool = True               # Enforce template constraints


class GenerationResult(BaseModel):
    """Result from the generator endpoint."""
    success: bool
    output_file_b64: Optional[str] = None  # Base64-encoded output file
    output_filename: str = ""
    file_type: FileType = FileType.PDF
    errors: list[str] = []
    warnings: list[str] = []


# ─────────────────────────────────────────────
# AI Endpoints
# ─────────────────────────────────────────────

class AIRequest(BaseModel):
    """Request to AI suggestion/improvement endpoint."""
    action: AIAction
    section_name: str
    field_label: str
    existing_text: Optional[str] = None   # For improve/shorten/tone
    context: dict[str, Any] = {}          # Additional context (other answers)
    constraints: Optional[TemplateInstruction] = None
    # User profile hints (from other answered fields)
    job_title: Optional[str] = None
    years_experience: Optional[str] = None


class AIResponse(BaseModel):
    """Response from AI endpoint."""
    success: bool
    generated_text: str = ""
    error: Optional[str] = None
