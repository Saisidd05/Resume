'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, TrendingUp, Scissors, Briefcase, Loader2 } from 'lucide-react';
import { useBuilderStore } from '@/store/builderStore';
import type { AIAction } from '@/hooks/useAI';

interface AnswerToolbarProps {
  onAction: (action: AIAction) => void;
  isLoading: boolean;
  lastAction: AIAction | null;
  hasText: boolean;
  disabled?: boolean;
}

const actions: { id: AIAction; label: string; Icon: React.ElementType; requiresText: boolean; color: string }[] = [
  { id: 'generate', label: 'Generate', Icon: Wand2, requiresText: false, color: '#FFC107' },
  { id: 'improve', label: 'Improve', Icon: TrendingUp, requiresText: true, color: '#FF8F00' },
  { id: 'shorten', label: 'Shorten', Icon: Scissors, requiresText: true, color: '#FF5722' },
  { id: 'professional_tone', label: 'Pro Tone', Icon: Briefcase, requiresText: true, color: '#E53935' },
];

export default function AnswerToolbar({
  onAction,
  isLoading,
  lastAction,
  hasText,
  disabled = false,
}: AnswerToolbarProps) {
  const { aiStatusAvailable } = useBuilderStore();
  const aiDisabled = aiStatusAvailable === false || disabled;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {actions.map(({ id, label, Icon, requiresText, color }) => {
        const isDisabledByText = requiresText && !hasText;
        const isThisLoading = isLoading && lastAction === id;
        const isDisabled = aiDisabled || isDisabledByText || (isLoading && lastAction !== id);

        return (
          <motion.button
            key={id}
            whileHover={!isDisabled ? { scale: 1.04, y: -1 } : {}}
            whileTap={!isDisabled ? { scale: 0.96 } : {}}
            onClick={() => !isDisabled && onAction(id)}
            disabled={isDisabled}
            id={`ai-${id}-btn`}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: isDisabled ? 'rgba(255,255,255,0.04)' : `${color}15`,
              border: `1px solid ${isDisabled ? 'rgba(255,255,255,0.08)' : `${color}30`}`,
              color: isDisabled ? 'rgba(255,255,255,0.3)' : color,
              cursor: isDisabled ? 'not-allowed' : 'pointer',
            }}
            title={
              aiDisabled
                ? 'AI not configured. Add API key to .env.local'
                : isDisabledByText
                  ? 'Type something first'
                  : undefined
            }
            data-tip={aiDisabled ? 'AI unavailable' : undefined}
          >
            <AnimatePresence mode="wait">
              {isThisLoading ? (
                <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Loader2 size={12} className="animate-spin" />
                </motion.span>
              ) : (
                <motion.span key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Icon size={12} />
                </motion.span>
              )}
            </AnimatePresence>
            {label}
          </motion.button>
        );
      })}

      {aiStatusAvailable === false && (
        <span
          className="flex items-center text-xs px-2"
          style={{ color: 'rgba(255,255,255,0.25)' }}
          title="Add OPENAI_API_KEY or ANTHROPIC_API_KEY to .env.local to enable AI"
        >
          AI unavailable
        </span>
      )}
    </div>
  );
}
