/**
 * Template Store — Zustand state for the parsed template and answers.
 *
 * Persists to localStorage automatically via the persist middleware.
 * This is the single source of truth for all template-related state.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Types (mirrors backend schemas) ──────────────────────────────────────────

export interface FontInfo {
  name: string;
  size: number;
  bold: boolean;
  italic: boolean;
  color?: string;
}

export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  page: number;
}

export interface TemplateInstruction {
  raw_text: string;
  section: string;
  min_lines?: number;
  max_lines?: number;
  min_bullets?: number;
  max_bullets?: number;
  min_words?: number;
  max_words?: number;
  min_chars?: number;
  max_chars?: number;
  min_count?: number;
  max_count?: number;
  custom_note?: string;
}

export interface Placeholder {
  id: string;
  label: string;
  section: string;
  original_text: string;
  font: FontInfo;
  bbox?: BoundingBox;
  paragraph_index?: number;
  run_index?: number;
  is_bullet: boolean;
  is_heading: boolean;
}

export interface Section {
  id: string;
  name: string;
  order: number;
  heading_text: string;
  heading_font: FontInfo;
  placeholders: Placeholder[];
  instructions: TemplateInstruction[];
  raw_content: string;
}

export interface ParsedTemplate {
  file_type: 'pdf' | 'docx';
  original_filename: string;
  page_count: number;
  sections: Section[];
  all_instructions: TemplateInstruction[];
  all_placeholders: Placeholder[];
  original_file_b64?: string;
  page_width?: number;
  page_height?: number;
  default_font: FontInfo;
}

export type QuestionFieldType =
  | 'text' | 'email' | 'phone' | 'url' | 'number' | 'decimal'
  | 'year' | 'month_year'
  | 'textarea' | 'list' | 'multifield'
  | 'tags' | 'multiselect' | 'language_block';

export interface QuestionField {
  id: string;
  label: string;
  placeholder_hint: string;
  question_type: QuestionFieldType;
  linked_placeholder_id?: string;
  required: boolean;
  is_optional?: boolean;
  constraints?: TemplateInstruction;
  ai_context: string;
  options?: string[];           // For multiselect / language_block proficiency
  repeatable_group?: string;
}

export interface QuestionCard {
  section_id: string;
  section_name: string;
  section_order: number;
  fields: QuestionField[];
  description: string;
  // Repeatable block support
  repeatable?: boolean;
  repeat_label?: string;
  repeat_min?: number;
  repeat_max?: number;
}

export interface QuestionFlow {
  cards: QuestionCard[];
  total_sections: number;
}

// ── Answer types ──────────────────────────────────────────────────────────────

export interface FieldAnswer {
  field_id: string;
  section_id: string;
  value: string;
  is_ai_generated: boolean;
}

// Repeatable instance: key = `${section_id}_instance_${instanceIndex}_${field_id}`
// Tags / multiselect values are stored as JSON arrays serialized to string
// Language block stored as JSON array of {language, proficiency} objects

// ── Store ─────────────────────────────────────────────────────────────────────

interface TemplateState {
  // Template data
  parsedTemplate: ParsedTemplate | null;
  questionFlow: QuestionFlow | null;

  // Upload state
  uploadedFile: File | null;
  uploadedFileUrl: string | null;
  isParsingTemplate: boolean;
  parseError: string | null;
  parseSummary: {
    sections_found: number;
    placeholders_found: number;
    instructions_found: number;
    question_cards: number;
  } | null;

  // Answers (flat map keyed by field_id, including repeatable instance keys)
  answers: Record<string, FieldAnswer>;

  // Repeatable instance counts per section_id
  repeatCounts: Record<string, number>;

  // Generation result
  generatedFileB64: string | null;
  generatedFileName: string | null;
  generatedFileType: 'pdf' | 'docx' | null;
  isGenerating: boolean;
  generationErrors: string[];
  generationWarnings: string[];

  // Actions
  setParsedTemplate: (template: ParsedTemplate, flow: QuestionFlow, summary: TemplateState['parseSummary']) => void;
  setUploadedFile: (file: File, url: string) => void;
  setParsingState: (loading: boolean, error?: string | null) => void;
  setAnswer: (fieldId: string, sectionId: string, value: string, isAI?: boolean) => void;
  clearAnswer: (fieldId: string) => void;
  clearAllAnswers: () => void;
  setRepeatCount: (sectionId: string, count: number) => void;
  addRepeatInstance: (sectionId: string) => void;
  removeRepeatInstance: (sectionId: string, index: number, fields: QuestionField[]) => void;
  setGenerationResult: (b64: string, filename: string, fileType: 'pdf' | 'docx') => void;
  setGenerating: (loading: boolean, errors?: string[], warnings?: string[]) => void;
  resetAll: () => void;
}

const initialState = {
  parsedTemplate: null,
  questionFlow: null,
  uploadedFile: null,
  uploadedFileUrl: null,
  isParsingTemplate: false,
  parseError: null,
  parseSummary: null,
  answers: {},
  repeatCounts: {},
  generatedFileB64: null,
  generatedFileName: null,
  generatedFileType: null,
  isGenerating: false,
  generationErrors: [],
  generationWarnings: [],
};

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setParsedTemplate: (template, flow, summary) =>
        set({
          parsedTemplate: template,
          questionFlow: flow,
          parseSummary: summary,
          parseError: null,
          isParsingTemplate: false,
        }),

      setUploadedFile: (file, url) =>
        set({ uploadedFile: null, uploadedFileUrl: url }), // File object not serializable

      setParsingState: (loading, error = null) =>
        set({ isParsingTemplate: loading, parseError: error }),

      setAnswer: (fieldId, sectionId, value, isAI = false) =>
        set((state) => ({
          answers: {
            ...state.answers,
            [fieldId]: { field_id: fieldId, section_id: sectionId, value, is_ai_generated: isAI },
          },
        })),

      clearAnswer: (fieldId) =>
        set((state) => {
          const next = { ...state.answers };
          delete next[fieldId];
          return { answers: next };
        }),

      clearAllAnswers: () => set({ answers: {}, repeatCounts: {} }),

      setRepeatCount: (sectionId, count) =>
        set((state) => ({
          repeatCounts: { ...state.repeatCounts, [sectionId]: count },
        })),

      addRepeatInstance: (sectionId) =>
        set((state) => ({
          repeatCounts: {
            ...state.repeatCounts,
            [sectionId]: (state.repeatCounts[sectionId] || 1) + 1,
          },
        })),

      removeRepeatInstance: (sectionId, index, fields) =>
        set((state) => {
          const currentCount = state.repeatCounts[sectionId] || 1;
          if (currentCount <= 1) return state;

          // Remove all answers for this instance
          const next = { ...state.answers };
          fields.forEach((f) => {
            const key = index === 0 ? f.id : `${sectionId}_instance_${index}_${f.id}`;
            delete next[key];
          });

          // Re-index subsequent instances' answers
          for (let i = index + 1; i < currentCount; i++) {
            fields.forEach((f) => {
              const oldKey = i === 0 ? f.id : `${sectionId}_instance_${i}_${f.id}`;
              const newKey = (i - 1) === 0 ? f.id : `${sectionId}_instance_${i - 1}_${f.id}`;
              if (next[oldKey]) {
                next[newKey] = { ...next[oldKey], field_id: newKey };
                delete next[oldKey];
              }
            });
          }

          return {
            answers: next,
            repeatCounts: {
              ...state.repeatCounts,
              [sectionId]: currentCount - 1,
            },
          };
        }),

      setGenerationResult: (b64, filename, fileType) =>
        set({
          generatedFileB64: b64,
          generatedFileName: filename,
          generatedFileType: fileType,
          isGenerating: false,
        }),

      setGenerating: (loading, errors = [], warnings = []) =>
        set({
          isGenerating: loading,
          generationErrors: errors,
          generationWarnings: warnings,
        }),

      resetAll: () => set({ ...initialState }),
    }),
    {
      name: 'at-your-hand-template-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        parsedTemplate: state.parsedTemplate
          ? { ...state.parsedTemplate, original_file_b64: undefined }
          : null,
        questionFlow: state.questionFlow,
        answers: state.answers,
        repeatCounts: state.repeatCounts,
        parseSummary: state.parseSummary,
        uploadedFileUrl: state.uploadedFileUrl,
      }),
    }
  )
);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Get the field answer key for a repeatable instance */
export function getRepeatableFieldKey(
  sectionId: string,
  instanceIndex: number,
  fieldId: string
): string {
  return instanceIndex === 0 ? fieldId : `${sectionId}_instance_${instanceIndex}_${fieldId}`;
}

/** Parse a JSON-array stored value safely */
export function parseArrayAnswer(value: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value ? [value] : [];
  }
}

/** Parse language block answer */
export function parseLanguageAnswer(value: string): Array<{ language: string; proficiency: string }> {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
