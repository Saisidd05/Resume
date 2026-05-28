/**
 * Constraint Parser (client-side) — mirrors backend template_engine.py
 * 
 * Parses written instruction strings from the template into structured
 * constraint objects for real-time validation in the UI.
 */

import type { TemplateInstruction } from '@/store/templateStore';

// Regex patterns (same as backend)
const RANGE_RE = /(\d+)\s*[–\-–to]+\s*(\d+)\s*(lines?|bullets?|bullet\s*points?|sentences?|words?)/gi;
const MIN_RE = /(?:minimum|at\s+least|min\.?)\s*(\d+)\s*(lines?|bullets?|bullet\s*points?|words?)/gi;
const MAX_RE = /(?:maximum|up\s+to|max\.?|no\s+more\s+than)\s*(\d+)\s*(lines?|bullets?|bullet\s*points?|words?)/gi;

export function parseConstraintFromText(
  text: string,
  sectionName: string
): TemplateInstruction | null {
  if (!text) return null;

  const ti: TemplateInstruction = { raw_text: text, section: sectionName };
  let found = false;

  // Range patterns
  let m: RegExpExecArray | null;
  RANGE_RE.lastIndex = 0;
  while ((m = RANGE_RE.exec(text)) !== null) {
    const lo = parseInt(m[1], 10);
    const hi = parseInt(m[2], 10);
    const unit = m[3].toLowerCase();
    if (unit.includes('line') || unit.includes('sentence')) {
      ti.min_lines = lo;
      ti.max_lines = hi;
    } else if (unit.includes('bullet')) {
      ti.min_bullets = lo;
      ti.max_bullets = hi;
    } else if (unit.includes('word')) {
      ti.min_words = lo;
      ti.max_words = hi;
    }
    found = true;
  }

  // Min patterns
  MIN_RE.lastIndex = 0;
  while ((m = MIN_RE.exec(text)) !== null) {
    const val = parseInt(m[1], 10);
    const unit = m[2].toLowerCase();
    if (unit.includes('line')) ti.min_lines = ti.min_lines ?? val;
    else if (unit.includes('bullet')) ti.min_bullets = ti.min_bullets ?? val;
    else if (unit.includes('word')) ti.min_words = ti.min_words ?? val;
    found = true;
  }

  // Max patterns
  MAX_RE.lastIndex = 0;
  while ((m = MAX_RE.exec(text)) !== null) {
    const val = parseInt(m[1], 10);
    const unit = m[2].toLowerCase();
    if (unit.includes('line')) ti.max_lines = ti.max_lines ?? val;
    else if (unit.includes('bullet')) ti.max_bullets = ti.max_bullets ?? val;
    else if (unit.includes('word')) ti.max_words = ti.max_words ?? val;
    found = true;
  }

  return found ? ti : null;
}

export function formatConstraintHint(c: TemplateInstruction): string {
  const parts: string[] = [];
  if (c.min_lines && c.max_lines) parts.push(`${c.min_lines}–${c.max_lines} lines`);
  else if (c.min_lines) parts.push(`at least ${c.min_lines} lines`);
  else if (c.max_lines) parts.push(`max ${c.max_lines} lines`);

  if (c.min_bullets && c.max_bullets) parts.push(`${c.min_bullets}–${c.max_bullets} bullets`);
  else if (c.max_bullets) parts.push(`max ${c.max_bullets} bullets`);

  if (c.min_words && c.max_words) parts.push(`${c.min_words}–${c.max_words} words`);
  else if (c.max_words) parts.push(`max ${c.max_words} words`);

  return parts.join(' · ');
}
