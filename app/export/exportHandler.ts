/**
 * Export Handler — triggers the resume generation API call and download.
 * 
 * Sends the parsed template + all answers to /api/generate.
 * Receives a base64-encoded file and initiates browser download.
 * The downloaded file is visually identical to the original template.
 */

import axios from 'axios';
import toast from 'react-hot-toast';
import { useTemplateStore } from '@/store/templateStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface GenerationOptions {
  strictMode: boolean;
  /** Base64 of the original template — must be passed in since it's not persisted in store */
  originalFileB64: string;
}

export async function generateAndDownload(opts: GenerationOptions): Promise<boolean> {
  const store = useTemplateStore.getState();
  const { parsedTemplate, answers } = store;

  if (!parsedTemplate) {
    toast.error('No template loaded. Please upload a template first.');
    return false;
  }

  if (!opts.originalFileB64) {
    toast.error('Template file data not available. Please re-upload the template.');
    return false;
  }

  const answerList = Object.values(answers);
  if (answerList.length === 0) {
    toast.error('Please answer at least one question before generating.');
    return false;
  }

  store.setGenerating(true);
  const toastId = toast.loading('Generating your resume...', { duration: Infinity });

  try {
    const requestPayload = {
      original_file_b64: opts.originalFileB64,
      file_type: parsedTemplate.file_type,
      original_filename: parsedTemplate.original_filename,
      parsed_template: parsedTemplate,
      answers: { answers: answerList },
      strict_mode: opts.strictMode,
    };

    const response = await axios.post(`${API_BASE}/api/generate`, requestPayload, {
      timeout: 60000,
    });

    const { success, output_file_b64, output_filename, file_type, errors, warnings } = response.data;

    if (!success || !output_file_b64) {
      const errMsg = errors?.[0] || 'Generation failed. Please try again.';
      toast.error(errMsg, { id: toastId, duration: 5000 });
      store.setGenerating(false, errors || []);
      return false;
    }

    // Show warnings if any
    if (warnings?.length) {
      warnings.forEach((w: string) => toast(w, { icon: '⚠️', duration: 4000 }));
    }

    // Store the result
    store.setGenerationResult(output_file_b64, output_filename, file_type);

    toast.success('Resume generated! Click Download to save.', { id: toastId, duration: 4000 });

    // Auto-trigger download
    downloadBase64File(output_file_b64, output_filename, file_type);

    return true;

  } catch (err: any) {
    const msg = err.response?.data?.detail || err.message || 'Generation failed';
    toast.error(msg, { id: toastId, duration: 5000 });
    store.setGenerating(false, [msg]);
    return false;
  }
}

export function downloadBase64File(
  b64: string,
  filename: string,
  fileType: 'pdf' | 'docx'
): void {
  const mimeType =
    fileType === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  const byteCharacters = atob(b64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
