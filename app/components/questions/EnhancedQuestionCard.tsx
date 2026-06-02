'use client';

/**
 * EnhancedQuestionCard — Handles all question types:
 *   text, email, phone, url, number, decimal, year, month_year,
 *   textarea, tags, multiselect, language_block
 */

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useTemplateStore, parseArrayAnswer, parseLanguageAnswer } from '@/store/templateStore';
import TagsInput from '@/components/ui/TagsInput';
import MultiSelectGrid from '@/components/ui/MultiSelectGrid';
import LanguageBlock from '@/components/ui/LanguageBlock';
import MonthYearPicker from '@/components/ui/MonthYearPicker';
import type { QuestionField } from '@/store/templateStore';

interface Props {
  field: QuestionField;
  sectionId: string;
  /** e.g. "exp_company" → actual key stored in answers */
  fieldKey: string;
}

// ── Simple inline validation ──────────────────────────────────────────────────
function validateField(value: string, field: QuestionField): { errors: string[]; ok: boolean } {
  const c = field.constraints;
  const errors: string[] = [];

  if (!value && !field.is_optional && field.required) {
    return { errors: ['This field is required'], ok: false };
  }
  if (!value) return { errors: [], ok: true };

  const len = value.trim().length;

  if (c?.min_chars && len < c.min_chars) errors.push(`Min ${c.min_chars} characters (${len} entered)`);
  if (c?.max_chars && len > c.max_chars) errors.push(`Max ${c.max_chars} characters (${len} entered)`);

  // Email
  if (field.question_type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    errors.push('Enter a valid email address');
  }

  // URL
  if (field.question_type === 'url') {
    try { new URL(value); } catch { errors.push('Enter a valid URL (include https://)'); }
  }

  // Phone
  if (field.question_type === 'phone' && !/^\+?[\d\s\-()]{10,15}$/.test(value)) {
    errors.push('Enter 10–15 digits');
  }

  // Year
  if (field.question_type === 'year' && !/^\d{4}$/.test(value)) {
    errors.push('Enter a 4-digit year');
  }

  // Decimal
  if (field.question_type === 'decimal' && isNaN(parseFloat(value))) {
    errors.push('Enter a valid number');
  }

  // Tags / multiselect count
  if (field.question_type === 'tags' || field.question_type === 'multiselect') {
    const arr = parseArrayAnswer(value);
    if (c?.min_count && arr.length < c.min_count) errors.push(`Select at least ${c.min_count}`);
    if (c?.max_count && arr.length > c.max_count) errors.push(`Select at most ${c.max_count}`);
  }

  // Language block
  if (field.question_type === 'language_block') {
    const entries = parseLanguageAnswer(value);
    if (c?.min_count && entries.length < c.min_count) errors.push(`Add at least ${c.min_count} language`);
    const incomplete = entries.some((e) => !e.language.trim());
    if (incomplete) errors.push('All language names are required');
  }

  return { errors, ok: errors.length === 0 };
}

export default function EnhancedQuestionCard({ field, sectionId, fieldKey }: Props) {
  const { answers, setAnswer } = useTemplateStore();
  const rawValue = answers[fieldKey]?.value || '';

  const save = useCallback(
    (val: string) => setAnswer(fieldKey, sectionId, val, false),
    [fieldKey, sectionId, setAnswer],
  );

  // Derived typed values
  const tagValue = parseArrayAnswer(rawValue);
  const langValue = parseLanguageAnswer(rawValue);

  const { errors, ok } = validateField(rawValue, field);
  const hasValue = rawValue.trim().length > 0;

  // ── Render the appropriate input ──────────────────────────────────────────

  const renderInput = () => {
    switch (field.question_type) {
      case 'tags':
        return (
          <TagsInput
            value={tagValue}
            onChange={(tags) => save(JSON.stringify(tags))}
            placeholder={field.placeholder_hint}
            maxTags={field.constraints?.max_count || 20}
            minTags={field.constraints?.min_count}
          />
        );

      case 'multiselect':
        return (
          <MultiSelectGrid
            options={field.options || []}
            value={tagValue}
            onChange={(sel) => save(JSON.stringify(sel))}
            min={field.constraints?.min_count}
            max={field.constraints?.max_count || 10}
          />
        );

      case 'language_block':
        return (
          <LanguageBlock
            value={langValue}
            onChange={(entries) => save(JSON.stringify(entries))}
          />
        );

      case 'month_year': {
        const isEnd = field.id.endsWith('_end') || field.label.toLowerCase().includes('end');
        return (
          <MonthYearPicker
            id={`input-${fieldKey}`}
            value={rawValue}
            onChange={save}
            allowPresent={isEnd}
          />
        );
      }

      case 'year':
        return (
          <select
            id={`input-${fieldKey}`}
            value={rawValue}
            onChange={(e) => save(e.target.value)}
            className={`input-field ${!ok && hasValue ? 'error' : ''}`}
            style={{ padding: '10px 12px' }}
          >
            <option value="">{field.placeholder_hint}</option>
            {Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i)).map(
              (y) => <option key={y} value={y}>{y}</option>,
            )}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            id={`input-${fieldKey}`}
            value={rawValue}
            onChange={(e) => save(e.target.value)}
            placeholder={field.placeholder_hint}
            className={`input-field ${!ok && hasValue ? 'error' : ''}`}
            rows={5}
            style={{ minHeight: 100, resize: 'vertical' }}
          />
        );

      case 'email':
        return (
          <input
            id={`input-${fieldKey}`}
            type="email"
            value={rawValue}
            onChange={(e) => save(e.target.value)}
            placeholder={field.placeholder_hint}
            className={`input-field ${!ok && hasValue ? 'error' : ''}`}
          />
        );

      case 'url':
        return (
          <input
            id={`input-${fieldKey}`}
            type="url"
            value={rawValue}
            onChange={(e) => save(e.target.value)}
            placeholder={field.placeholder_hint}
            className={`input-field ${!ok && hasValue ? 'error' : ''}`}
          />
        );

      case 'phone':
      case 'number':
        return (
          <input
            id={`input-${fieldKey}`}
            type="tel"
            value={rawValue}
            onChange={(e) => save(e.target.value)}
            placeholder={field.placeholder_hint}
            className={`input-field ${!ok && hasValue ? 'error' : ''}`}
          />
        );

      case 'decimal':
        return (
          <input
            id={`input-${fieldKey}`}
            type="number"
            step="0.01"
            value={rawValue}
            onChange={(e) => save(e.target.value)}
            placeholder={field.placeholder_hint}
            className={`input-field ${!ok && hasValue ? 'error' : ''}`}
          />
        );

      default:
        return (
          <input
            id={`input-${fieldKey}`}
            type="text"
            value={rawValue}
            onChange={(e) => save(e.target.value)}
            placeholder={field.placeholder_hint}
            className={`input-field ${!ok && hasValue ? 'error' : ''}`}
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
      id={`question-field-${fieldKey}`}
    >
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={`input-${fieldKey}`}
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: field.required && !rawValue.trim() ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.7)',
          }}
        >
          {field.label}
          {field.required && <span style={{ color: '#E53935', marginLeft: 4 }}>*</span>}
          {field.is_optional && (
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginLeft: 6, fontWeight: 400 }}>
              optional
            </span>
          )}
        </label>

        {/* Char counter for text inputs */}
        {hasValue &&
          ['text', 'email', 'url', 'phone', 'textarea'].includes(field.question_type) && (
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
              {rawValue.trim().length}
              {field.constraints?.max_chars ? `/${field.constraints.max_chars}` : ''} chars
            </span>
          )}
      </div>

      {/* Constraint hint */}
      {field.constraints?.raw_text && (
        <div
          className="flex items-center gap-1.5 mb-2"
          style={{ color: 'rgba(255,193,7,0.65)', fontSize: '11px' }}
        >
          <Info size={11} />
          <span>{field.constraints.raw_text}</span>
        </div>
      )}

      {/* Input */}
      {renderInput()}

      {/* Validation */}
      <AnimatePresence>
        {hasValue && errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-1"
          >
            {errors.map((err, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: '#EF5350' }}>
                <AlertCircle size={11} />
                {err}
              </div>
            ))}
          </motion.div>
        )}

        {hasValue && ok && field.constraints && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1 flex items-center gap-1 text-xs"
            style={{ color: 'rgba(72,199,142,0.8)' }}
          >
            <CheckCircle size={11} />
            Looks good!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
