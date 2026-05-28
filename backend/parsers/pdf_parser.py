"""
PDF Parser — extracts structure from resume template PDFs.

Strategy:
  1. Use PyMuPDF (fitz) to extract text blocks with full font metadata.
  2. Identify section headings by font-size hierarchy (largest non-name fonts).
  3. Extract placeholder regions (underscores, brackets, ALL-CAPS labels).
  4. Detect written instructions (regex patterns like "3–4 lines", "5–10 bullets").
  5. Record bounding boxes for every placeholder so the generator can
     overlay replacement text at the EXACT same position.

CRITICAL: This parser reads the template — it NEVER modifies the original file.
"""
from __future__ import annotations

import re
import base64
import logging
from typing import Optional
from collections import defaultdict

import fitz  # PyMuPDF (import as fitz works in both 1.24 and 1.25)

from backend.models.schemas import (
    ParsedTemplate, Section, Placeholder, FontInfo,
    BoundingBox, TemplateInstruction, FileType
)

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# Regex patterns for detecting placeholders
# ─────────────────────────────────────────────
# Matches: [Your Name], [Name], __________  (underscores), {{name}}, <Name>
PLACEHOLDER_PATTERNS = [
    re.compile(r'\[([A-Za-z][^\[\]]{1,60})\]'),          # [Field Name]
    re.compile(r'\{\{([A-Za-z][^\{\}]{1,60})\}\}'),       # {{field_name}}
    re.compile(r'<([A-Za-z][^<>]{1,60})>'),               # <Field Name>
    re.compile(r'_{3,}'),                                  # ___ (blank lines)
    re.compile(r'\.{4,}'),                                 # .... (dotted blanks)
]

# Matches instruction-style text within template
# e.g., "3–4 lines", "5 to 10 bullet points", "minimum 2 lines"
INSTRUCTION_PATTERNS = [
    # "3–4 lines" / "3-4 lines" / "3 to 4 lines"
    re.compile(
        r'(\d+)\s*[–\-–to]+\s*(\d+)\s*(lines?|bullets?|bullet\s*points?|sentences?|words?)',
        re.IGNORECASE
    ),
    # "minimum 3 lines" / "at least 5 bullets"
    re.compile(
        r'(?:minimum|at\s+least|min\.?)\s*(\d+)\s*(lines?|bullets?|bullet\s*points?|words?)',
        re.IGNORECASE
    ),
    # "maximum 5 lines" / "up to 3 bullets"
    re.compile(
        r'(?:maximum|up\s+to|max\.?)\s*(\d+)\s*(lines?|bullets?|bullet\s*points?|words?)',
        re.IGNORECASE
    ),
    # "3 lines" (exact)
    re.compile(
        r'\b(\d+)\s*(lines?|bullets?|bullet\s*points?)\b',
        re.IGNORECASE
    ),
]


def _make_font_info(flags: int, size: float, font_name: str, color: int = 0) -> FontInfo:
    """Convert PyMuPDF font flags to FontInfo model."""
    bold = bool(flags & 2**4)
    italic = bool(flags & 2**1)
    hex_color = f"#{color:06X}" if color else "#000000"
    return FontInfo(
        name=font_name,
        size=round(size, 2),
        bold=bold,
        italic=italic,
        color=hex_color,
    )


def _extract_instruction(text: str, section_name: str) -> Optional[TemplateInstruction]:
    """
    Parse a text string for written constraints.
    Returns a TemplateInstruction if patterns are found, else None.
    """
    # Range pattern: "3–4 lines"
    range_match = INSTRUCTION_PATTERNS[0].search(text)
    if range_match:
        lo, hi = int(range_match.group(1)), int(range_match.group(2))
        unit = range_match.group(3).lower()
        ti = TemplateInstruction(raw_text=text, section=section_name)
        if 'line' in unit or 'sentence' in unit:
            ti.min_lines, ti.max_lines = lo, hi
        elif 'bullet' in unit:
            ti.min_bullets, ti.max_bullets = lo, hi
        elif 'word' in unit:
            ti.min_words, ti.max_words = lo, hi
        return ti

    # Min pattern
    min_match = INSTRUCTION_PATTERNS[1].search(text)
    if min_match:
        val = int(min_match.group(1))
        unit = min_match.group(2).lower()
        ti = TemplateInstruction(raw_text=text, section=section_name)
        if 'line' in unit:
            ti.min_lines = val
        elif 'bullet' in unit:
            ti.min_bullets = val
        return ti

    # Max pattern
    max_match = INSTRUCTION_PATTERNS[2].search(text)
    if max_match:
        val = int(max_match.group(1))
        unit = max_match.group(2).lower()
        ti = TemplateInstruction(raw_text=text, section=section_name)
        if 'line' in unit:
            ti.max_lines = val
        elif 'bullet' in unit:
            ti.max_bullets = val
        return ti

    return None


def _is_placeholder_text(text: str) -> bool:
    """Return True if this text block looks like a placeholder."""
    stripped = text.strip()
    if not stripped:
        return False
    for pattern in PLACEHOLDER_PATTERNS:
        if pattern.search(stripped):
            return True
    # ALL CAPS short labels e.g. "NAME", "PHONE NUMBER"
    if stripped.isupper() and 2 < len(stripped) < 40:
        return True
    return False


def _detect_section_headings(blocks: list[dict]) -> list[tuple[float, str]]:
    """
    Find the font sizes used for section headings.
    Strategy: collect all font sizes, rank them. The top 2-3 sizes are headings.
    """
    size_counts: dict[float, int] = defaultdict(int)
    for block in blocks:
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                size = round(span["size"], 1)
                size_counts[size] += len(span["text"].strip())

    if not size_counts:
        return []

    # Sort sizes descending; body text is the most frequent large bucket
    sorted_sizes = sorted(size_counts.keys(), reverse=True)

    # The largest font is usually the name (skip it for headings)
    # The next 2-3 sizes are section headings
    heading_sizes = sorted_sizes[1:4] if len(sorted_sizes) > 3 else sorted_sizes[:2]
    return [(s, "") for s in heading_sizes]


def parse_pdf(file_bytes: bytes, filename: str) -> ParsedTemplate:
    """
    Main PDF parsing entry point.
    Returns a fully populated ParsedTemplate.
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")

    # Encode original bytes so generator can reconstruct the file
    original_b64 = base64.b64encode(file_bytes).decode("utf-8")

    page_count = len(doc)
    page_width = doc[0].rect.width if page_count > 0 else 595.0
    page_height = doc[0].rect.height if page_count > 0 else 842.0

    # ── Collect ALL text blocks across all pages ──────────────────────────────
    all_blocks: list[dict] = []
    for page_num, page in enumerate(doc):
        blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)["blocks"]
        for block in blocks:
            block["_page"] = page_num  # annotate with page number
        all_blocks.extend(blocks)

    # ── Determine heading font sizes ─────────────────────────────────────────
    heading_size_pairs = _detect_section_headings(all_blocks)
    heading_sizes = {s for s, _ in heading_size_pairs}

    # Fallback: use any bold text >= 11pt as potential heading
    if not heading_sizes:
        heading_sizes = {11.0, 12.0, 13.0, 14.0}

    # ── Walk blocks and build sections ───────────────────────────────────────
    sections: list[Section] = []
    current_section: Optional[Section] = None
    placeholder_counter = 0
    all_instructions: list[TemplateInstruction] = []
    all_placeholders: list[Placeholder] = []

    # Default font from most common span
    default_font = FontInfo(name="Helvetica", size=11.0)

    for block in all_blocks:
        if block.get("type") != 0:  # 0 = text block
            continue

        page_num = block.get("_page", 0)
        bbox_raw = block.get("bbox", (0, 0, 100, 12))

        for line in block.get("lines", []):
            line_text = ""
            line_font: Optional[FontInfo] = None

            for span in line.get("spans", []):
                span_text = span.get("text", "")
                span_size = round(span.get("size", 11.0), 1)
                span_flags = span.get("flags", 0)
                span_font = span.get("font", "Helvetica")
                span_color = span.get("color", 0)
                span_bbox = span.get("bbox", bbox_raw)

                fi = _make_font_info(span_flags, span_size, span_font, span_color)
                if line_font is None:
                    line_font = fi

                line_text += span_text

                # ── Is this span a section heading? ───────────────────────
                is_heading = (
                    span_size in heading_sizes
                    and fi.bold
                    and len(span_text.strip()) > 1
                    and not span_text.strip().isdigit()
                )

                if is_heading and span_text.strip():
                    section_name = span_text.strip()
                    # Don't create a new section for very short heading fragments
                    if len(section_name) >= 3:
                        current_section = Section(
                            id=f"section_{len(sections)}",
                            name=section_name,
                            order=len(sections),
                            heading_text=section_name,
                            heading_font=fi,
                        )
                        sections.append(current_section)
                        continue

                # ── If no section started yet, create a default one ────────
                if current_section is None:
                    current_section = Section(
                        id="section_header",
                        name="Personal Information",
                        order=0,
                        heading_text="Personal Information",
                        heading_font=fi,
                    )
                    sections.insert(0, current_section)

                # ── Append raw content to current section ─────────────────
                current_section.raw_content += span_text

                # ── Check for written instructions ───────────────────────
                instruction = _extract_instruction(span_text, current_section.name)
                if instruction:
                    current_section.instructions.append(instruction)
                    all_instructions.append(instruction)

                # ── Check for placeholder text ─────────────────────────────
                if _is_placeholder_text(span_text):
                    ph_bbox = BoundingBox(
                        x0=span_bbox[0],
                        y0=span_bbox[1],
                        x1=span_bbox[2],
                        y1=span_bbox[3],
                        page=page_num,
                    )
                    ph = Placeholder(
                        id=f"ph_{placeholder_counter}",
                        label=_infer_label(span_text.strip(), current_section.name),
                        section=current_section.id,
                        original_text=span_text.strip(),
                        font=fi,
                        bbox=ph_bbox,
                        is_bullet=span_text.strip().startswith(('•', '-', '*', '◦')),
                        is_heading=False,
                    )
                    current_section.placeholders.append(ph)
                    all_placeholders.append(ph)
                    placeholder_counter += 1

    doc.close()

    # Re-index sections to ensure correct order
    for i, sec in enumerate(sections):
        sec.order = i

    return ParsedTemplate(
        file_type=FileType.PDF,
        original_filename=filename,
        page_count=page_count,
        sections=sections,
        all_instructions=all_instructions,
        all_placeholders=all_placeholders,
        original_file_b64=original_b64,
        page_width=page_width,
        page_height=page_height,
        default_font=default_font,
    )


def _infer_label(text: str, section_name: str) -> str:
    """Try to infer a human-readable label from placeholder text."""
    # Strip bracket-style markers
    clean = re.sub(r'[\[\]{}<>]', '', text).strip()
    if clean:
        # Convert underscores and dots to label
        clean = re.sub(r'[_.]+', ' ', clean).strip()
        if clean:
            return clean.title()
    # Fallback: use section name
    return f"{section_name} Field"
