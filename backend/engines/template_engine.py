"""
Template Intelligence Engine — reads and enforces written constraints.

This engine is the guardian of the cardinal rule: TEMPLATE IN = TEMPLATE OUT.
It:
  1. Parses constraint instructions from extracted template text.
  2. Validates user answers against those constraints before generation.
  3. Provides enforcement functions that trim/expand content to fit constraints.

All validation happens BEFORE the generator writes to the output file.
"""
from __future__ import annotations

import re
import logging
from dataclasses import dataclass, field
from typing import Optional

from backend.models.schemas import TemplateInstruction, Section, ParsedTemplate

logger = logging.getLogger(__name__)


@dataclass
class ValidationResult:
    """Result of validating an answer against template constraints."""
    is_valid: bool = True
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    suggested_fix: Optional[str] = None


def parse_instruction_from_text(text: str, section_name: str) -> Optional[TemplateInstruction]:
    """
    Comprehensive instruction parser — tries all known patterns.
    Returns TemplateInstruction or None.
    """
    if not text:
        return None

    text_lower = text.lower()
    ti = TemplateInstruction(raw_text=text, section=section_name)
    found_any = False

    # ── Range patterns ────────────────────────────────────────────────────────
    range_re = re.compile(
        r'(\d+)\s*[–\-–to]+\s*(\d+)\s*(lines?|bullets?|bullet\s*points?|sentences?|words?)',
        re.IGNORECASE
    )
    for m in range_re.finditer(text):
        lo, hi = int(m.group(1)), int(m.group(2))
        unit = m.group(3).lower()
        if 'line' in unit or 'sentence' in unit:
            ti.min_lines, ti.max_lines = lo, hi
        elif 'bullet' in unit:
            ti.min_bullets, ti.max_bullets = lo, hi
        elif 'word' in unit:
            ti.min_words, ti.max_words = lo, hi
        found_any = True

    # ── Min-only patterns ─────────────────────────────────────────────────────
    min_re = re.compile(
        r'(?:minimum|at\s+least|min\.?)\s*(\d+)\s*(lines?|bullets?|bullet\s*points?|words?)',
        re.IGNORECASE
    )
    for m in min_re.finditer(text):
        val = int(m.group(1))
        unit = m.group(2).lower()
        if 'line' in unit:
            ti.min_lines = ti.min_lines or val
        elif 'bullet' in unit:
            ti.min_bullets = ti.min_bullets or val
        elif 'word' in unit:
            ti.min_words = ti.min_words or val
        found_any = True

    # ── Max-only patterns ─────────────────────────────────────────────────────
    max_re = re.compile(
        r'(?:maximum|up\s+to|max\.?|no\s+more\s+than)\s*(\d+)\s*(lines?|bullets?|bullet\s*points?|words?)',
        re.IGNORECASE
    )
    for m in max_re.finditer(text):
        val = int(m.group(1))
        unit = m.group(2).lower()
        if 'line' in unit:
            ti.max_lines = ti.max_lines or val
        elif 'bullet' in unit:
            ti.max_bullets = ti.max_bullets or val
        elif 'word' in unit:
            ti.max_words = ti.max_words or val
        found_any = True

    return ti if found_any else None


def get_section_constraints(
    section: Section,
    parsed_template: ParsedTemplate
) -> TemplateInstruction:
    """
    Aggregate all constraints for a given section into one TemplateInstruction.
    Merges constraints from section.instructions + global template instructions.
    """
    merged = TemplateInstruction(raw_text="", section=section.name)

    all_instructions = list(section.instructions) + [
        inst for inst in parsed_template.all_instructions
        if inst.section == section.name
    ]

    for inst in all_instructions:
        if inst.min_lines is not None:
            merged.min_lines = inst.min_lines
        if inst.max_lines is not None:
            merged.max_lines = inst.max_lines
        if inst.min_bullets is not None:
            merged.min_bullets = inst.min_bullets
        if inst.max_bullets is not None:
            merged.max_bullets = inst.max_bullets
        if inst.min_words is not None:
            merged.min_words = inst.min_words
        if inst.max_words is not None:
            merged.max_words = inst.max_words
        if inst.custom_note:
            merged.custom_note = (merged.custom_note or "") + " " + inst.custom_note

    return merged


def validate_answer(
    answer: str,
    constraints: TemplateInstruction,
    is_bullet_section: bool = False,
) -> ValidationResult:
    """
    Validate a user's answer against the section's constraints.
    Returns a ValidationResult with errors and warnings.
    """
    result = ValidationResult()

    if not answer.strip():
        return result  # Empty is handled by required-field logic separately

    lines = [l for l in answer.split('\n') if l.strip()]
    bullets = [l for l in lines if l.strip().startswith(('•', '-', '*', '◦', '→'))]
    words = len(answer.split())

    # ── Line constraints ──────────────────────────────────────────────────────
    if constraints.min_lines is not None and len(lines) < constraints.min_lines:
        result.is_valid = False
        result.errors.append(
            f"Needs at least {constraints.min_lines} lines (currently {len(lines)})"
        )

    if constraints.max_lines is not None and len(lines) > constraints.max_lines:
        result.is_valid = False
        result.errors.append(
            f"Maximum {constraints.max_lines} lines allowed (currently {len(lines)})"
        )
        # Suggest trimmed version
        result.suggested_fix = '\n'.join(lines[:constraints.max_lines])

    # ── Bullet constraints ────────────────────────────────────────────────────
    if is_bullet_section and bullets:
        if constraints.min_bullets is not None and len(bullets) < constraints.min_bullets:
            result.is_valid = False
            result.errors.append(
                f"Needs at least {constraints.min_bullets} bullet points (currently {len(bullets)})"
            )

        if constraints.max_bullets is not None and len(bullets) > constraints.max_bullets:
            result.is_valid = False
            result.errors.append(
                f"Maximum {constraints.max_bullets} bullet points allowed (currently {len(bullets)})"
            )
            result.suggested_fix = '\n'.join(bullets[:constraints.max_bullets])

    # ── Word constraints ──────────────────────────────────────────────────────
    if constraints.min_words is not None and words < constraints.min_words:
        result.warnings.append(
            f"Recommended minimum {constraints.min_words} words (currently {words})"
        )

    if constraints.max_words is not None and words > constraints.max_words:
        result.warnings.append(
            f"Recommended maximum {constraints.max_words} words (currently {words})"
        )

    return result


def enforce_constraints(text: str, constraints: TemplateInstruction) -> str:
    """
    Hard-enforce constraints by trimming content if necessary.
    Used during generation when strict_mode=True.
    """
    if not text:
        return text

    lines = text.split('\n')
    non_empty = [l for l in lines if l.strip()]

    # Hard trim lines if over max
    if constraints.max_lines is not None and len(non_empty) > constraints.max_lines:
        non_empty = non_empty[:constraints.max_lines]
        logger.info(f"Trimmed to {constraints.max_lines} lines per template constraint")

    # Hard trim bullets if over max
    if constraints.max_bullets is not None:
        bullets = [l for l in non_empty if l.strip().startswith(('•', '-', '*', '◦', '→'))]
        if len(bullets) > constraints.max_bullets:
            # Keep first N bullets + any non-bullet lines
            kept_bullets = 0
            result_lines = []
            for line in non_empty:
                if line.strip().startswith(('•', '-', '*', '◦', '→')):
                    if kept_bullets < constraints.max_bullets:
                        result_lines.append(line)
                        kept_bullets += 1
                else:
                    result_lines.append(line)
            non_empty = result_lines

    return '\n'.join(non_empty)
