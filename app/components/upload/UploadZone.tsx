'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { useTemplateParser } from '@/hooks/useTemplateParser';
import { useTemplateStore } from '@/store/templateStore';

export default function UploadZone() {
  const { parseTemplate } = useTemplateParser();
  const { isParsingTemplate, parseError, parsedTemplate, parseSummary, resetAll } =
    useTemplateStore();
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        parseTemplate(file);
      }
    },
    [parseTemplate]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
    disabled: isParsingTemplate,
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
    onDropAccepted: () => setDragOver(false),
    onDropRejected: () => setDragOver(false),
  });

  // Success state
  if (parsedTemplate && parseSummary && !isParsingTemplate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <div
          className="glass-card rounded-2xl p-8"
          style={{ border: '1px solid rgba(255,193,7,0.25)' }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(255,193,7,0.15)', border: '1px solid rgba(255,193,7,0.3)' }}
            >
              <CheckCircle size={22} style={{ color: '#FFC107' }} />
            </div>
            <div className="flex-1">
              <h3
                style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}
              >
                Template Parsed Successfully
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                {parsedTemplate.original_filename}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {[
                  { label: 'Sections', value: parseSummary.sections_found },
                  { label: 'Placeholders', value: parseSummary.placeholders_found },
                  { label: 'Instructions', value: parseSummary.instructions_found },
                  { label: 'Question Sets', value: parseSummary.question_cards },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-3 text-center"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="text-2xl font-black gradient-text"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {stat.value}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={resetAll}
              className="text-gray-500 hover:text-white transition-colors"
              title="Upload a different template"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`upload-zone cursor-pointer ${isDragActive || dragOver ? 'drag-over' : ''}`}
        id="template-upload-zone"
      >
        <input {...getInputProps()} id="template-file-input" />

        <AnimatePresence mode="wait">
          {isParsingTemplate ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.2)' }}
                >
                  <Loader2 size={32} className="animate-spin" style={{ color: '#FFC107' }} />
                </div>
              </div>
              <div>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  Analysing your template...
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                  Extracting sections, fonts, and structure
                </p>
              </div>
              <div className="progress-bar w-48">
                <div className="progress-fill shimmer-bg" style={{ width: '60%' }} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-5"
            >
              <motion.div
                animate={isDragActive ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{
                  background: isDragActive ? 'rgba(255,193,7,0.15)' : 'rgba(255,255,255,0.04)',
                  border: isDragActive ? '1px solid rgba(255,193,7,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  transition: 'background 0.2s, border 0.2s',
                }}
              >
                {isDragActive ? (
                  <FileText size={32} style={{ color: '#FFC107' }} />
                ) : (
                  <Upload size={32} style={{ color: 'rgba(255,255,255,0.4)' }} />
                )}
              </motion.div>

              <div>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    marginBottom: '0.375rem',
                    color: isDragActive ? '#FFC107' : 'white',
                    transition: 'color 0.2s',
                  }}
                >
                  {isDragActive ? 'Drop your template here' : 'Upload Your Resume Template'}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
                  Drag & drop or click to browse · PDF or DOCX · Max 20 MB
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className="px-4 py-1.5 rounded-full text-sm font-medium"
                  style={{ background: 'rgba(255,193,7,0.12)', color: '#FFC107', border: '1px solid rgba(255,193,7,0.2)' }}
                >
                  PDF
                </span>
                <span
                  className="px-4 py-1.5 rounded-full text-sm font-medium"
                  style={{ background: 'rgba(229,57,53,0.12)', color: '#EF5350', border: '1px solid rgba(229,57,53,0.2)' }}
                >
                  DOCX
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error display */}
      <AnimatePresence>
        {parseError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 flex items-start gap-3 p-4 rounded-xl"
            style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.25)' }}
          >
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#EF5350' }} />
            <p style={{ color: '#EF5350', fontSize: '0.875rem' }}>{parseError}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
