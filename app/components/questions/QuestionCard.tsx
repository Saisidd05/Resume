'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useTemplateStore } from '@/store/templateStore';
import { useBuilderStore } from '@/store/builderStore';
import { useAI } from '@/hooks/useAI';
import { validateAnswer } from '@/template-engine/constraintValidator';
import { formatConstraintHint } from '@/template-engine/constraintParser';
import AnswerToolbar from './AnswerToolbar';
import type { QuestionField } from '@/store/templateStore';

interface QuestionCardProps {
  field: QuestionField;
  sectionId: string;
  sectionName: string;
  context?: Record<string, string>;
}

export default function QuestionCard({ field, sectionId, sectionName, context }: QuestionCardProps) {
  const { answers, setAnswer } = useTemplateStore();
  const currentValue = answers[field.id]?.value || '';
  const [localValue, setLocalValue] = useState(currentValue);

  const ai = useAI({
    sectionName,
    fieldLabel: field.label,
    aiContext: field.ai_context,
    constraints: field.constraints,
    context,
  });

  const validation = validateAnswer(
    localValue,
    field.constraints,
    sectionName.toLowerCase().includes('experience') || sectionName.toLowerCase().includes('project')
  );

  const constraintHint = field.constraints ? formatConstraintHint(field.constraints) : '';

  const handleChange = useCallback((value: string) => {
    setLocalValue(value);
    setAnswer(field.id, sectionId, value, false);
  }, [field.id, sectionId, setAnswer]);

  const handleAIAction = useCallback(async (action: Parameters<typeof ai.generate>[0] extends string ? any : any) => {
    let result: string | null = null;

    const jobTitle = context?.['job_title'] || context?.['role_applying_for'] || '';
    const years = context?.['years_experience'] || '';

    switch (action) {
      case 'generate':
        result = await ai.generate(jobTitle, years);
        break;
      case 'improve':
        result = await ai.improve(localValue);
        break;
      case 'shorten':
        result = await ai.shorten(localValue);
        break;
      case 'professional_tone':
        result = await ai.professionalTone(localValue);
        break;
    }

    if (result) {
      setLocalValue(result);
      setAnswer(field.id, sectionId, result, true);
    }
  }, [ai, localValue, field.id, sectionId, setAnswer, context]);

  const isTextarea = field.question_type === 'textarea' || field.question_type === 'list';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-5"
      id={`question-field-${field.id}`}
    >
      {/* Label */}
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor={`input-${field.id}`}
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: field.required && !localValue.trim() ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.7)',
          }}
        >
          {field.label}
          {field.required && (
            <span style={{ color: '#E53935', marginLeft: 4 }}>*</span>
          )}
        </label>

        {/* Character/word counter */}
        {localValue && (
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
            {validation.wordCount}w · {validation.lineCount}l
          </span>
        )}
      </div>

      {/* Constraint hint */}
      {constraintHint && (
        <div
          className="flex items-center gap-1.5 mb-2"
          style={{ color: 'rgba(255,193,7,0.7)', fontSize: '11px' }}
        >
          <Info size={11} />
          <span>Template requires: {constraintHint}</span>
        </div>
      )}

      {/* Template instruction note */}
      {field.constraints?.raw_text && (
        <div
          className="mb-2 px-3 py-1.5 rounded-lg text-xs"
          style={{
            background: 'rgba(255,193,7,0.06)',
            border: '1px solid rgba(255,193,7,0.12)',
            color: 'rgba(255,193,7,0.6)',
          }}
        >
          📋 {field.constraints.raw_text}
        </div>
      )}

      {/* Input */}
      {isTextarea ? (
        <textarea
          id={`input-${field.id}`}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder_hint}
          className={`input-field ${!validation.isValid && localValue ? 'error' : ''}`}
          rows={5}
          style={{ minHeight: 100 }}
        />
      ) : (
        <input
          id={`input-${field.id}`}
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder_hint}
          className={`input-field ${!validation.isValid && localValue ? 'error' : ''}`}
        />
      )}

      {/* AI toolbar */}
      <AnswerToolbar
        onAction={handleAIAction}
        isLoading={ai.isLoading}
        lastAction={ai.lastAction}
        hasText={localValue.trim().length > 0}
      />

      {/* Validation feedback */}
      <AnimatePresence>
        {localValue && (validation.errors.length > 0 || validation.warnings.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-1"
          >
            {validation.errors.map((err, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-xs"
                style={{ color: '#EF5350' }}
              >
                <AlertCircle size={11} />
                {err}
              </div>
            ))}
            {validation.warnings.map((warn, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-xs"
                style={{ color: 'rgba(255,193,7,0.7)' }}
              >
                <Info size={11} />
                {warn}
              </div>
            ))}
          </motion.div>
        )}

        {/* Valid indicator */}
        {localValue && validation.isValid && validation.errors.length === 0 && field.constraints && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-1 flex items-center gap-1 text-xs"
            style={{ color: 'rgba(72, 199, 142, 0.8)' }}
          >
            <CheckCircle size={11} />
            Meets template requirements
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
