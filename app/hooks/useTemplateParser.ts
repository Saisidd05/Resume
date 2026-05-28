/**
 * useTemplateParser — custom hook for uploading and parsing a template file.
 * 
 * Sends the file to the FastAPI /api/parse endpoint and stores the result
 * in the template store. Also validates file type before upload.
 */
'use client';

import { useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTemplateStore } from '@/store/templateStore';
import { useBuilderStore } from '@/store/builderStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function useTemplateParser() {
  const {
    setParsingState,
    setParsedTemplate,
    setUploadedFile,
    resetAll,
  } = useTemplateStore();
  const { goToStep, setAIStatus } = useBuilderStore();

  const parseTemplate = useCallback(async (file: File) => {
    // ── Validate file type ────────────────────────────────────────────────────
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc'].includes(ext || '')) {
      toast.error('Only PDF and DOCX files are supported.');
      return;
    }

    const maxSizeMB = 20;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File is too large. Maximum size: ${maxSizeMB} MB.`);
      return;
    }

    // ── Reset previous state ──────────────────────────────────────────────────
    resetAll();
    setParsingState(true, null);

    // ── Create object URL for local preview ───────────────────────────────────
    const fileUrl = URL.createObjectURL(file);
    setUploadedFile(file, fileUrl);

    // ── Build form data ───────────────────────────────────────────────────────
    const formData = new FormData();
    formData.append('file', file);

    const toastId = toast.loading('Analysing your template...', { duration: Infinity });

    try {
      const response = await axios.post(`${API_BASE}/api/parse`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
        onUploadProgress: (e) => {
          const pct = Math.round(((e.loaded || 0) / (e.total || 1)) * 100);
          if (pct < 100) {
            toast.loading(`Uploading... ${pct}%`, { id: toastId });
          } else {
            toast.loading('Parsing template structure...', { id: toastId });
          }
        },
      });

      const { parsed_template, question_flow, summary } = response.data;

      // Store in Zustand
      setParsedTemplate(parsed_template, question_flow, summary);

      toast.success(
        `Template parsed! Found ${summary.sections_found} sections and ${summary.question_cards} question sets.`,
        { id: toastId, duration: 4000 }
      );

      // Move to questions step
      goToStep('questions');

      // Check AI availability in background
      checkAIStatus(setAIStatus);

    } catch (err: any) {
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Failed to parse template. Please try again.';
      setParsingState(false, message);
      toast.error(message, { id: toastId, duration: 5000 });
    }
  }, [setParsingState, setParsedTemplate, setUploadedFile, resetAll, goToStep, setAIStatus]);

  return { parseTemplate };
}

async function checkAIStatus(setAIStatus: (v: boolean) => void) {
  try {
    const res = await axios.get(
      `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')}/api/ai/status`,
      { timeout: 5000 }
    );
    setAIStatus(res.data.available === true);
  } catch {
    setAIStatus(false);
  }
}
