'use client';

/**
 * RepeatableSection — renders one or more instances of a repeatable card
 * (Experience, Education, Awards) with Add/Remove instance buttons.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useTemplateStore, getRepeatableFieldKey } from '@/store/templateStore';
import EnhancedQuestionCard from './EnhancedQuestionCard';
import type { QuestionCard } from '@/store/templateStore';

interface RepeatableSectionProps {
  card: QuestionCard;
}

export default function RepeatableSection({ card }: RepeatableSectionProps) {
  const { repeatCounts, addRepeatInstance, removeRepeatInstance, setRepeatCount, answers } =
    useTemplateStore();

  // For sections with repeat_min=0 (e.g. Awards), default to 0 instances until user clicks Add
  const rawCount = repeatCounts[card.section_id];
  const defaultCount = card.repeat_min === 0 ? 0 : 1;
  const effectiveCount = rawCount !== undefined ? rawCount : defaultCount;

  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});

  const toggleCollapse = (i: number) =>
    setCollapsed((prev) => ({ ...prev, [i]: !prev[i] }));

  const addInstance = () => {
    if (rawCount === undefined || effectiveCount === 0) {
      setRepeatCount(card.section_id, 1);
    } else {
      addRepeatInstance(card.section_id);
    }
  };

  const removeInstance = (idx: number) => {
    removeRepeatInstance(card.section_id, idx, card.fields);
    const newCount = effectiveCount - 1;
    if (newCount === 0) {
      setRepeatCount(card.section_id, 0);
    }
  };

  const maxReached = effectiveCount >= (card.repeat_max || 10);

  const instanceLabel = card.repeat_label || 'Entry';

  // Get a preview title for a collapsed instance
  const getInstanceTitle = (idx: number): string => {
    const firstField = card.fields[0];
    if (!firstField) return `${instanceLabel} ${idx + 1}`;
    const key = getRepeatableFieldKey(card.section_id, idx, firstField.id);
    const val = answers[key]?.value?.trim();
    return val || `${instanceLabel} ${idx + 1}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <AnimatePresence>
        {Array.from({ length: effectiveCount }, (_, i) => (
          <motion.div
            key={`${card.section_id}_instance_${i}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {/* Instance header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.03)',
                borderBottom: collapsed[i] ? 'none' : '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
              }}
              onClick={() => toggleCollapse(i)}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    background: 'rgba(255,193,7,0.15)',
                    border: '1px solid rgba(255,193,7,0.3)',
                    color: '#FFC107',
                    borderRadius: '50%',
                    width: '22px',
                    height: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                {getInstanceTitle(i)}
              </span>

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {effectiveCount > (card.repeat_min || 1) && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeInstance(i); }}
                    title={`Remove this ${instanceLabel}`}
                    style={{
                      background: 'rgba(229,57,53,0.08)',
                      border: '1px solid rgba(229,57,53,0.18)',
                      borderRadius: '6px',
                      padding: '5px',
                      cursor: 'pointer',
                      color: '#EF5350',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleCollapse(i); }}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '6px',
                    padding: '5px',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {collapsed[i] ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                </button>
              </div>
            </div>

            {/* Instance fields */}
            <AnimatePresence>
              {!collapsed[i] && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ padding: '16px' }}
                >
                  {card.fields.map((field) => {
                    const fieldKey = getRepeatableFieldKey(card.section_id, i, field.id);
                    return (
                      <EnhancedQuestionCard
                        key={fieldKey}
                        field={field}
                        sectionId={card.section_id}
                        fieldKey={fieldKey}
                      />
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add More button */}
      {!maxReached && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addInstance}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '10px',
            border: '2px dashed rgba(255,193,7,0.35)',
            background: 'rgba(255,193,7,0.04)',
            color: 'rgba(255,193,7,0.8)',
            fontSize: '13px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.18s',
            width: '100%',
          }}
          id={`add-more-${card.section_id}`}
        >
          <Plus size={16} />
          Add More {instanceLabel}
        </motion.button>
      )}

      {maxReached && (
        <div style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
          Maximum {card.repeat_max} {instanceLabel.toLowerCase()}s reached
        </div>
      )}
    </div>
  );
}
