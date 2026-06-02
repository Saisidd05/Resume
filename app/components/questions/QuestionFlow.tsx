'use client';

/**
 * StaticQuestionFlow — renders the 7-section hardcoded question flow.
 * Supports repeatable sections (Experience, Education, Awards).
 */

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react';
import { useBuilderStore } from '@/store/builderStore';
import { useTemplateStore, getRepeatableFieldKey } from '@/store/templateStore';
import EnhancedQuestionCard from './EnhancedQuestionCard';
import RepeatableSection from './RepeatableSection';

export default function QuestionFlow() {
  const { currentSectionIndex, goToSection, nextSection, prevSection, nextStep } =
    useBuilderStore();
  const { questionFlow, answers, repeatCounts } = useTemplateStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate overall form completion progress (starts at 0% and increases as they type)
  const getOverallProgress = (): number => {
    if (!questionFlow) return 0;
    let totalRequired = 0;
    let totalFilledRequired = 0;

    questionFlow.cards.forEach((card) => {
      const isRepeatable = card.repeatable;
      const count = isRepeatable ? (repeatCounts[card.section_id] ?? (card.repeat_min || 0)) : 1;
      const requiredFields = card.fields.filter((f) => f.required);

      if (isRepeatable) {
        for (let i = 0; i < count; i++) {
          requiredFields.forEach((f) => {
            totalRequired++;
            const key = getRepeatableFieldKey(card.section_id, i, f.id);
            if (answers[key]?.value?.trim()) {
              totalFilledRequired++;
            }
          });
        }
      } else {
        requiredFields.forEach((f) => {
          totalRequired++;
          if (answers[f.id]?.value?.trim()) {
            totalFilledRequired++;
          }
        });
      }
    });

    if (totalRequired === 0) return 0;
    return Math.round((totalFilledRequired / totalRequired) * 100);
  };

  if (!questionFlow || questionFlow.cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
        <div style={{ color: 'rgba(255,255,255,0.3)' }}>
          Loading question form…
        </div>
      </div>
    );
  }

  const overallProgress = getOverallProgress();

  const totalSections = questionFlow.cards.length;
  const currentCard = questionFlow.cards[currentSectionIndex];
  const isLastSection = currentSectionIndex === totalSections - 1;

  // ── Count answered fields for progress ─────────────────────────────────────
  const countAnsweredForCard = (cardIdx: number): number => {
    const card = questionFlow.cards[cardIdx];
    if (!card.repeatable) {
      return card.fields.filter((f) => answers[f.id]?.value?.trim()).length;
    }
    const count = repeatCounts[card.section_id] ?? 1;
    let answered = 0;
    for (let i = 0; i < count; i++) {
      card.fields.forEach((f) => {
        const key = getRepeatableFieldKey(card.section_id, i, f.id);
        if (answers[key]?.value?.trim()) answered++;
      });
    }
    return answered;
  };

  const totalFieldsForCard = (cardIdx: number): number => {
    const card = questionFlow.cards[cardIdx];
    if (!card.repeatable) return card.fields.filter((f) => f.required).length;
    const count = repeatCounts[card.section_id] ?? 1;
    return count * card.fields.filter((f) => f.required).length;
  };

  const answeredCount = countAnsweredForCard(currentSectionIndex);
  const totalRequired = totalFieldsForCard(currentSectionIndex);

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    scrollToTop();
    if (isLastSection) nextStep();
    else nextSection();
  };

  const handlePrev = () => {
    scrollToTop();
    prevSection();
  };

  // Section icon / emoji mapping
  const SECTION_ICONS: Record<string, string> = {
    personal_info: '👤',
    executive_summary: '📝',
    technical_skills: '⚙️',
    soft_skills: '💬',
    experience: '💼',
    projects: '🚀',
    education: '🎓',
    awards: '🏆',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Section tab bar */}
      <div
        className="flex gap-2 overflow-x-auto pb-3 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {questionFlow.cards.map((card, idx) => {
          const isActive = idx === currentSectionIndex;
          const answered = countAnsweredForCard(idx);
          const required = totalFieldsForCard(idx);
          const isComplete = required > 0 && answered >= required;

          return (
            <button
              key={card.section_id}
              onClick={() => { goToSection(idx); scrollToTop(); }}
              id={`section-tab-${idx}`}
              className="flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: isActive
                  ? 'rgba(255,193,7,0.15)'
                  : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isActive ? 'rgba(255,193,7,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: isActive ? '#FFC107' : 'rgba(255,255,255,0.45)',
              }}
            >
              {isComplete ? (
                <CheckCircle size={11} style={{ color: '#4CAF50' }} />
              ) : (
                <Circle size={11} />
              )}
              <span>{SECTION_ICONS[card.section_id] || ''} {card.section_name}</span>
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="progress-bar my-3">
        <div
          className="progress-fill"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>{SECTION_ICONS[currentCard.section_id] || ''}</span>
            {currentCard.section_name}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', marginTop: '2px' }}>
            Section {currentSectionIndex + 1} of {totalSections}
            {totalRequired > 0 && ` · ${answeredCount}/${totalRequired} required fields`}
          </p>
        </div>
        <div
          className="text-right text-xs font-bold gradient-text"
          style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem' }}
        >
          {overallProgress}%
        </div>
      </div>

      {/* Section description */}
      {currentCard.description && (
        <div
          className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{
            background: 'rgba(255,193,7,0.05)',
            border: '1px solid rgba(255,193,7,0.12)',
            color: 'rgba(255,193,7,0.75)',
          }}
        >
          {currentCard.description}
        </div>
      )}

      {/* Questions scroll area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto pr-1" style={{ minHeight: 0 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.section_id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {currentCard.repeatable ? (
              <RepeatableSection card={currentCard} />
            ) : (
              currentCard.fields.map((field) => (
                <EnhancedQuestionCard
                  key={field.id}
                  field={field}
                  sectionId={currentCard.section_id}
                  fieldKey={field.id}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation footer */}
      <div
        className="flex items-center justify-between mt-4 pt-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <button
          onClick={handlePrev}
          disabled={currentSectionIndex === 0}
          className="flex items-center gap-2 btn-secondary text-sm"
          style={{ padding: '10px 20px', opacity: currentSectionIndex === 0 ? 0.3 : 1 }}
          id="prev-section-btn"
        >
          <ChevronLeft size={16} />
          Previous
        </button>

        <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>
          {currentSectionIndex + 1} / {totalSections}
        </span>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          className="flex items-center gap-2 btn-primary text-sm"
          style={{ padding: '10px 20px' }}
          id="next-section-btn"
        >
          {isLastSection ? 'Preview Resume' : 'Next Section'}
          <ChevronRight size={16} />
        </motion.button>
      </div>
    </div>
  );
}
