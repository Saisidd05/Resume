'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react';
import { useBuilderStore } from '@/store/builderStore';
import { useTemplateStore } from '@/store/templateStore';
import QuestionCard from './QuestionCard';

export default function QuestionFlow() {
  const { currentSectionIndex, goToSection, nextSection, prevSection, nextStep } =
    useBuilderStore();
  const { questionFlow, answers } = useTemplateStore();
  const containerRef = useRef<HTMLDivElement>(null);

  if (!questionFlow || questionFlow.cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
        <div style={{ color: 'rgba(255,255,255,0.3)' }}>
          No questions available. Please upload a template first.
        </div>
      </div>
    );
  }

  const totalSections = questionFlow.cards.length;
  const currentCard = questionFlow.cards[currentSectionIndex];
  const isLastSection = currentSectionIndex === totalSections - 1;

  // Build answer context from previously answered fields for AI
  const answerContext: Record<string, string> = {};
  Object.values(answers).forEach((ans) => {
    const key = ans.field_id.split('_').slice(2).join('_');
    answerContext[key] = ans.value;
  });

  // Count answered fields in current card
  const answeredCount = currentCard.fields.filter(
    (f) => answers[f.id]?.value?.trim()
  ).length;
  const totalFields = currentCard.fields.length;

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    scrollToTop();
    if (isLastSection) {
      nextStep(); // Go to preview/export step
    } else {
      nextSection();
    }
  };

  const handlePrev = () => {
    scrollToTop();
    prevSection();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Section tabs */}
      <div
        className="flex gap-2 overflow-x-auto pb-3 px-1"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {questionFlow.cards.map((card, idx) => {
          const cardAnswered = card.fields.filter(
            (f) => answers[f.id]?.value?.trim()
          ).length;
          const isActive = idx === currentSectionIndex;
          const isComplete = cardAnswered === card.fields.length && card.fields.length > 0;

          return (
            <button
              key={card.section_id}
              onClick={() => { goToSection(idx); scrollToTop(); }}
              id={`section-tab-${idx}`}
              className="flex items-center gap-2 flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
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
              {card.section_name}
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="progress-bar my-3">
        <div
          className="progress-fill"
          style={{ width: `${((currentSectionIndex + 1) / totalSections) * 100}%` }}
        />
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700,
              fontSize: '1.15rem',
            }}
          >
            {currentCard.section_name}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '2px' }}>
            Section {currentSectionIndex + 1} of {totalSections} ·{' '}
            {answeredCount}/{totalFields} fields answered
          </p>
        </div>
        <div
          className="text-right text-xs font-bold gradient-text"
          style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem' }}
        >
          {Math.round(((currentSectionIndex + 1) / totalSections) * 100)}%
        </div>
      </div>

      {/* Template instruction note for section */}
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
            {currentCard.fields.map((field) => (
              <QuestionCard
                key={field.id}
                field={field}
                sectionId={currentCard.section_id}
                sectionName={currentCard.section_name}
                context={answerContext}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
