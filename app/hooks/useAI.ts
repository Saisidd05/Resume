/**
 * useAI — custom hook for AI content generation and improvement.
 * 
 * Wraps the /api/ai/suggest endpoint with per-field loading states.
 * When AI is unavailable, provides a helpful message rather than silently failing.
 */
'use client';

import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useBuilderStore } from '@/store/builderStore';
import type { TemplateInstruction } from '@/store/templateStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export type AIAction = 'generate' | 'improve' | 'shorten' | 'professional_tone';

interface UseAIOptions {
  sectionName: string;
  fieldLabel: string;
  aiContext?: string;
  constraints?: TemplateInstruction;
  context?: Record<string, string>; // other answered fields for context
}

interface UseAIReturn {
  generate: (jobTitle?: string, yearsExp?: string) => Promise<string | null>;
  improve: (existingText: string) => Promise<string | null>;
  shorten: (existingText: string) => Promise<string | null>;
  professionalTone: (existingText: string) => Promise<string | null>;
  isLoading: boolean;
  lastAction: AIAction | null;
}

export function useAI(opts: UseAIOptions): UseAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [lastAction, setLastAction] = useState<AIAction | null>(null);
  const { aiStatusAvailable } = useBuilderStore();

  const callAI = useCallback(
    async (action: AIAction, existingText?: string, extra?: Record<string, string>): Promise<string | null> => {
      // Check AI availability
      if (aiStatusAvailable === false) {
        toast.error(
          'AI features not configured. Add an API key in .env.local to enable.',
          { duration: 4000 }
        );
        return null;
      }

      setIsLoading(true);
      setLastAction(action);

      const toastId = toast.loading(
        action === 'generate' ? 'Generating content...' :
        action === 'improve' ? 'Improving your text...' :
        action === 'shorten' ? 'Making it more concise...' :
        'Applying professional tone...',
        { duration: Infinity }
      );

      try {
        const response = await axios.post(
          `${API_BASE}/api/ai/suggest`,
          {
            action,
            section_name: opts.sectionName,
            field_label: opts.fieldLabel,
            existing_text: existingText,
            context: { ...opts.context, ...extra },
            constraints: opts.constraints,
            job_title: extra?.job_title,
            years_experience: extra?.years_experience,
          },
          { timeout: 30000 }
        );

        const { success, generated_text, error } = response.data;

        if (!success || !generated_text) {
          throw new Error(error || 'AI returned empty response');
        }

        toast.success('Done!', { id: toastId, duration: 2000 });
        return generated_text;

      } catch (err: any) {
        const msg = err.response?.data?.detail || err.message || 'AI request failed';
        toast.error(msg, { id: toastId, duration: 4000 });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [opts, aiStatusAvailable]
  );

  return {
    generate: (jobTitle, yearsExp) =>
      callAI('generate', undefined, { job_title: jobTitle || '', years_experience: yearsExp || '' }),
    improve: (text) => callAI('improve', text),
    shorten: (text) => callAI('shorten', text),
    professionalTone: (text) => callAI('professional_tone', text),
    isLoading,
    lastAction,
  };
}
