'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, CheckCircle, AlertCircle, FileText, RefreshCw } from 'lucide-react';
import { useTemplateStore } from '@/store/templateStore';
import { useBuilderStore } from '@/store/builderStore';
import { generateAndDownload, downloadBase64File } from '@/export/exportHandler';

export default function ExportPanel() {
  const {
    parsedTemplate,
    answers,
    isGenerating,
    generatedFileB64,
    generatedFileName,
    generatedFileType,
    generationErrors,
    generationWarnings,
  } = useTemplateStore();

  const { strictMode } = useBuilderStore();

  // Store original file b64 in memory (not in Zustand/localStorage due to size)
  const originalFileB64Ref = useRef<string | null>(null);
  const [fileLoaded, setFileLoaded] = useState(false);

  const answeredCount = Object.values(answers).filter((a) => a.value.trim()).length;
  const totalFields =
    parsedTemplate
      ? parsedTemplate.sections.reduce((sum, s) => sum + s.placeholders.length, 0)
      : 0;

  // Load the original file as base64 for sending to backend
  const loadOriginalFile = async (url: string): Promise<string> => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleGenerate = async () => {
    const { uploadedFileUrl } = useTemplateStore.getState();

    let b64 = originalFileB64Ref.current;

    if (!b64 && uploadedFileUrl) {
      try {
        b64 = await loadOriginalFile(uploadedFileUrl);
        originalFileB64Ref.current = b64;
        setFileLoaded(true);
      } catch (e) {
        console.error('Failed to load template file:', e);
      }
    }

    if (!b64) {
      alert('Please re-upload your template file. The original file data is not available.');
      return;
    }

    await generateAndDownload({ strictMode, originalFileB64: b64 });
  };

  const handleReDownload = () => {
    if (generatedFileB64 && generatedFileName && generatedFileType) {
      downloadBase64File(generatedFileB64, generatedFileName, generatedFileType);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status overview */}
      <div className="glass-card rounded-2xl p-5">
        <h3
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: '1rem',
            marginBottom: '1rem',
          }}
        >
          Ready to Generate?
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            {
              label: 'Template',
              value: parsedTemplate ? '✓ Loaded' : '✗ Missing',
              ok: !!parsedTemplate,
            },
            {
              label: 'Answers',
              value: `${answeredCount} filled`,
              ok: answeredCount > 0,
            },
            {
              label: 'Strict Mode',
              value: strictMode ? 'ON' : 'OFF',
              ok: true,
              neutral: !strictMode,
            },
            {
              label: 'Format',
              value: parsedTemplate?.file_type?.toUpperCase() || '—',
              ok: !!parsedTemplate,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl p-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '2px' }}>
                {item.label}
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: item.ok ? (item.neutral ? '#FFC107' : '#4CAF50') : '#E53935',
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Generate button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={isGenerating || !parsedTemplate || answeredCount === 0}
          id="generate-resume-btn"
          className="w-full btn-primary flex items-center justify-center gap-3"
          style={{
            padding: '14px',
            fontSize: '15px',
            opacity: isGenerating || !parsedTemplate || answeredCount === 0 ? 0.5 : 1,
            cursor: isGenerating || !parsedTemplate || answeredCount === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating Resume...
            </>
          ) : (
            <>
              <FileText size={18} />
              Generate Resume
            </>
          )}
        </motion.button>
      </div>

      {/* Warnings */}
      <AnimatePresence>
        {generationWarnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl p-4 space-y-2"
            style={{ background: 'rgba(255,193,7,0.08)', border: '1px solid rgba(255,193,7,0.2)' }}
          >
            {generationWarnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-sm" style={{ color: '#FFC107' }}>
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                {w}
              </div>
            ))}
          </motion.div>
        )}

        {generationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl p-4 space-y-2"
            style={{ background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.2)' }}
          >
            {generationErrors.map((e, i) => (
              <div key={i} className="flex items-start gap-2 text-sm" style={{ color: '#EF5350' }}>
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                {e}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download section — shown after successful generation */}
      <AnimatePresence>
        {generatedFileB64 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-2xl p-5"
            style={{ border: '1px solid rgba(76,175,80,0.25)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)' }}
              >
                <CheckCircle size={20} style={{ color: '#4CAF50' }} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  Resume Generated!
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem' }}>
                  {generatedFileName}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReDownload}
                id="download-resume-btn"
                className="flex-1 btn-primary flex items-center justify-center gap-2"
                style={{ padding: '12px' }}
              >
                <Download size={16} />
                Download{' '}
                {generatedFileType?.toUpperCase()}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGenerate}
                disabled={isGenerating}
                className="btn-secondary flex items-center gap-2"
                style={{ padding: '12px 20px' }}
                title="Re-generate with current answers"
              >
                <RefreshCw size={15} />
                Re-generate
              </motion.button>
            </div>

            <p
              className="text-center mt-3 text-xs"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              Your template structure is preserved exactly
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strict mode info */}
      <div
        className="rounded-xl p-4 text-sm"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div
            className={`strict-badge ${strictMode ? 'on' : 'off'}`}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: strictMode ? '#E53935' : 'rgba(255,255,255,0.3)' }}
            />
            Strict Mode {strictMode ? 'ON' : 'OFF'}
          </div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', lineHeight: 1.5 }}>
          {strictMode
            ? 'Layout, fonts, spacing, and section order are locked. Only content placeholders will be replaced.'
            : 'Strict mode is off. Template constraints may not be enforced.'}
        </p>
      </div>
    </div>
  );
}
