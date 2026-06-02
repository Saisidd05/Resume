/**
 * useDefaultTemplate — loads the static hardcoded question flow.
 *
 * Always resets any cached/stale data from localStorage and loads
 * the static 7-section question flow. No backend required.
 */
'use client';

import { useCallback, useEffect } from 'react';
import { useTemplateStore } from '@/store/templateStore';
import { useBuilderStore } from '@/store/builderStore';
import {
  STATIC_QUESTION_FLOW,
  STATIC_PARSED_TEMPLATE,
  STATIC_SUMMARY,
} from '@/data/staticQuestionFlow';

/** Version key — bump this whenever the question flow changes to force a refresh */
const FLOW_VERSION = 'static-v2';
const FLOW_VERSION_KEY = 'ayh-flow-version';

export function useDefaultTemplate() {
  const {
    setParsedTemplate,
    setParsingState,
    resetAll,
  } = useTemplateStore();
  const { goToStep, setAIStatus } = useBuilderStore();

  const loadDefaultTemplate = useCallback(async (force = false) => {
    const storedVersion = typeof window !== 'undefined'
      ? localStorage.getItem(FLOW_VERSION_KEY)
      : null;

    // If version mismatch or forced, clear stale cache first
    if (force || storedVersion !== FLOW_VERSION) {
      resetAll();
      if (typeof window !== 'undefined') {
        // Also clear the persisted zustand store key directly
        localStorage.removeItem('at-your-hand-template-store');
        localStorage.setItem(FLOW_VERSION_KEY, FLOW_VERSION);
      }
    }

    setParsingState(true, null);

    // Small delay so loading screen renders
    await new Promise((r) => setTimeout(r, 200));

    setParsedTemplate(
      STATIC_PARSED_TEMPLATE as any,
      STATIC_QUESTION_FLOW,
      STATIC_SUMMARY,
    );

    goToStep('questions');
    setAIStatus(false);
  }, [setParsedTemplate, setParsingState, resetAll, goToStep, setAIStatus]);

  // Always check version on mount — clear stale cache if needed
  useEffect(() => {
    loadDefaultTemplate();
  }, []); // eslint-disable-line

  return { loadDefaultTemplate };
}
