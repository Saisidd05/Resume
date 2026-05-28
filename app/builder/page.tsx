'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FileText, ArrowLeft, Home } from 'lucide-react';
import { useBuilderStore } from '@/store/builderStore';
import { useTemplateStore } from '@/store/templateStore';
import UploadZone from '@/components/upload/UploadZone';
import QuestionFlow from '@/components/questions/QuestionFlow';
import LivePreview from '@/components/preview/LivePreview';
import ExportPanel from '@/components/export/ExportPanel';
import StrictModeToggle from '@/components/ui/StrictModeToggle';
import type { BuilderStep } from '@/store/builderStore';

// ── Step indicator ────────────────────────────────────────────────────────────
const steps: { id: BuilderStep; label: string; icon: string }[] = [
  { id: 'upload', label: 'Upload', icon: '01' },
  { id: 'questions', label: 'Questions', icon: '02' },
  { id: 'preview', label: 'Preview', icon: '03' },
  { id: 'export', label: 'Export', icon: '04' },
];

function StepIndicator() {
  const { currentStep, goToStep } = useBuilderStore();
  const { parsedTemplate } = useTemplateStore();

  const currentIdx = steps.findIndex((s) => s.id === currentStep);

  const canNavigateTo = (stepId: BuilderStep) => {
    const stepIdx = steps.findIndex((s) => s.id === stepId);
    // Can always go back; can go forward only if template is loaded
    if (stepIdx <= currentIdx) return true;
    if (!parsedTemplate) return stepIdx <= 0;
    return true;
  };

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, idx) => {
        const isActive = step.id === currentStep;
        const isPast = idx < currentIdx;
        const canNav = canNavigateTo(step.id);

        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => canNav && goToStep(step.id)}
              disabled={!canNav}
              className="flex items-center gap-2"
              style={{ cursor: canNav ? 'pointer' : 'not-allowed' }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: isActive
                    ? '#FFC107'
                    : isPast
                      ? 'rgba(76,175,80,0.2)'
                      : 'rgba(255,255,255,0.08)',
                  color: isActive
                    ? '#0A0A0A'
                    : isPast
                      ? '#4CAF50'
                      : 'rgba(255,255,255,0.3)',
                  border: isActive
                    ? 'none'
                    : isPast
                      ? '1px solid rgba(76,175,80,0.4)'
                      : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {isPast ? '✓' : step.icon}
              </div>
              <span
                className="hidden sm:block text-xs font-medium"
                style={{
                  color: isActive
                    ? '#FFC107'
                    : isPast
                      ? 'rgba(255,255,255,0.5)'
                      : 'rgba(255,255,255,0.2)',
                }}
              >
                {step.label}
              </span>
            </button>
            {idx < steps.length - 1 && (
              <div
                className="w-6 h-px mx-1"
                style={{ background: isPast ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.08)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main Builder Page ─────────────────────────────────────────────────────────
export default function BuilderPage() {
  const { currentStep, goToStep } = useBuilderStore();
  const { parsedTemplate } = useTemplateStore();

  // Auto-advance to questions if template already loaded
  useEffect(() => {
    if (parsedTemplate && currentStep === 'upload') {
      goToStep('questions');
    }
  }, []); // eslint-disable-line

  const showTwoPanel = currentStep === 'questions';
  const showPreviewOnly = currentStep === 'preview';
  const showExport = currentStep === 'export';

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--surface)' }}>
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-4 sm:px-6 h-14 flex-shrink-0"
        style={{
          background: 'rgba(10,10,10,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Left: Logo + back */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group" title="Back to home">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FFC107, #E53935)' }}
            >
              <FileText size={13} className="text-black" />
            </div>
            <span
              className="hidden sm:block text-sm font-bold"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              At Your Hand
            </span>
          </Link>

          <div
            className="hidden sm:block w-px h-5"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          />

          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 text-xs"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <Home size={12} />
            Home
          </Link>
        </div>

        {/* Center: Step indicator */}
        <StepIndicator />

        {/* Right: Strict mode toggle */}
        <StrictModeToggle />
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* UPLOAD STEP */}
          {currentStep === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex items-center justify-center p-6"
            >
              <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                  <h1
                    style={{
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
                      fontWeight: 800,
                      marginBottom: '0.75rem',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Upload Your{' '}
                    <span className="gradient-text">Resume Template</span>
                  </h1>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem' }}>
                    PDF or DOCX · Your template stays exactly as-is
                  </p>
                </div>
                <UploadZone />
              </div>
            </motion.div>
          )}

          {/* QUESTIONS STEP — Two-panel layout */}
          {currentStep === 'questions' && (
            <motion.div
              key="questions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="h-full flex"
            >
              {/* LEFT: Question flow */}
              <div
                className="flex flex-col"
                style={{
                  width: '45%',
                  minWidth: '320px',
                  maxWidth: '600px',
                  borderRight: '1px solid rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                  padding: '20px',
                }}
              >
                <QuestionFlow />
              </div>

              {/* RIGHT: Live preview */}
              <div className="flex-1 overflow-hidden" style={{ background: '#111' }}>
                <LivePreview />
              </div>
            </motion.div>
          )}

          {/* PREVIEW STEP */}
          {showPreviewOnly && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
              style={{ background: '#111' }}
            >
              <LivePreview />
            </motion.div>
          )}

          {/* EXPORT STEP */}
          {showExport && (
            <motion.div
              key="export"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full flex"
            >
              {/* Left: Preview */}
              <div
                className="hidden md:block flex-1 overflow-hidden"
                style={{ background: '#111', borderRight: '1px solid rgba(255,255,255,0.06)' }}
              >
                <LivePreview />
              </div>

              {/* Right: Export panel */}
              <div
                className="w-full md:w-96 overflow-y-auto p-6"
              >
                <h2
                  className="mb-6"
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 800,
                    fontSize: '1.5rem',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Generate &{' '}
                  <span className="gradient-text">Download</span>
                </h2>
                <ExportPanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
