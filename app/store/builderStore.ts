/**
 * Builder Store — UI navigation state for the multi-step builder flow.
 * 
 * Controls: current step, section navigation, strict mode toggle.
 * Does NOT persist between sessions (intentional — UI state only).
 */
import { create } from 'zustand';

export type BuilderStep = 'upload' | 'questions' | 'preview' | 'export';

interface BuilderState {
  // Step navigation
  currentStep: BuilderStep;
  currentSectionIndex: number;
  
  // Strict Template Mode — default ON
  strictMode: boolean;
  strictModeWarningShown: boolean;
  
  // UI state
  previewVisible: boolean;
  aiStatusAvailable: boolean | null; // null = not checked yet
  
  // Actions
  goToStep: (step: BuilderStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToSection: (index: number) => void;
  nextSection: () => void;
  prevSection: () => void;
  toggleStrictMode: () => void;
  setStrictMode: (enabled: boolean) => void;
  setStrictModeWarningShown: () => void;
  setPreviewVisible: (v: boolean) => void;
  setAIStatus: (available: boolean) => void;
  resetBuilder: () => void;
}

const STEPS: BuilderStep[] = ['upload', 'questions', 'preview', 'export'];

export const useBuilderStore = create<BuilderState>((set, get) => ({
  currentStep: 'upload',
  currentSectionIndex: 0,
  strictMode: true,          // Default ON — enforce TEMPLATE IN = TEMPLATE OUT
  strictModeWarningShown: false,
  previewVisible: true,
  aiStatusAvailable: null,

  goToStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep } = get();
    const idx = STEPS.indexOf(currentStep);
    if (idx < STEPS.length - 1) {
      set({ currentStep: STEPS[idx + 1] });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    const idx = STEPS.indexOf(currentStep);
    if (idx > 0) {
      set({ currentStep: STEPS[idx - 1] });
    }
  },

  goToSection: (index) => set({ currentSectionIndex: index }),

  nextSection: () =>
    set((state) => ({ currentSectionIndex: state.currentSectionIndex + 1 })),

  prevSection: () =>
    set((state) => ({
      currentSectionIndex: Math.max(0, state.currentSectionIndex - 1),
    })),

  toggleStrictMode: () => {
    const { strictMode, strictModeWarningShown } = get();
    if (strictMode && !strictModeWarningShown) {
      // Will show a warning — let the component handle it
      return;
    }
    set({ strictMode: !strictMode });
  },

  setStrictMode: (enabled) => set({ strictMode: enabled }),

  setStrictModeWarningShown: () => set({ strictModeWarningShown: true }),

  setPreviewVisible: (v) => set({ previewVisible: v }),

  setAIStatus: (available) => set({ aiStatusAvailable: available }),

  resetBuilder: () =>
    set({
      currentStep: 'upload',
      currentSectionIndex: 0,
      strictModeWarningShown: false,
    }),
}));
