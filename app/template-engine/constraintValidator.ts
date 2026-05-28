/**
 * Constraint Validator (client-side) — real-time answer validation.
 * 
 * Validates user answers against template-extracted constraints
 * and returns errors/warnings for immediate UI feedback.
 */

import type { TemplateInstruction } from '@/store/templateStore';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  charCount: number;
  wordCount: number;
  lineCount: number;
  bulletCount: number;
}

export function validateAnswer(
  answer: string,
  constraints: TemplateInstruction | undefined,
  isBulletSection = false
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    charCount: answer.length,
    wordCount: answer.trim() ? answer.trim().split(/\s+/).length : 0,
    lineCount: 0,
    bulletCount: 0,
  };

  if (!answer.trim() || !constraints) {
    result.lineCount = 0;
    return result;
  }

  const lines = answer.split('\n').filter((l) => l.trim());
  const bullets = lines.filter((l) => /^[\•\-\*◦→]/.test(l.trim()));
  result.lineCount = lines.length;
  result.bulletCount = bullets.length;

  // Line constraints
  if (constraints.min_lines != null && lines.length < constraints.min_lines) {
    result.isValid = false;
    result.errors.push(`Needs at least ${constraints.min_lines} lines (currently ${lines.length})`);
  }
  if (constraints.max_lines != null && lines.length > constraints.max_lines) {
    result.isValid = false;
    result.errors.push(`Maximum ${constraints.max_lines} lines allowed (currently ${lines.length})`);
  }

  // Bullet constraints
  if (isBulletSection && bullets.length > 0) {
    if (constraints.min_bullets != null && bullets.length < constraints.min_bullets) {
      result.isValid = false;
      result.errors.push(`Needs at least ${constraints.min_bullets} bullet points`);
    }
    if (constraints.max_bullets != null && bullets.length > constraints.max_bullets) {
      result.isValid = false;
      result.errors.push(`Maximum ${constraints.max_bullets} bullet points allowed`);
    }
  }

  // Word constraints (warnings only)
  if (constraints.min_words != null && result.wordCount < constraints.min_words) {
    result.warnings.push(`Recommended: at least ${constraints.min_words} words`);
  }
  if (constraints.max_words != null && result.wordCount > constraints.max_words) {
    result.warnings.push(`Recommended: max ${constraints.max_words} words`);
  }

  return result;
}
