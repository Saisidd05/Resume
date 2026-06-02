'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FileText, Home, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBuilderStore } from '@/store/builderStore';
import { useTemplateStore } from '@/store/templateStore';
import { useDefaultTemplate } from '@/hooks/useDefaultTemplate';
import QuestionFlow from '@/components/questions/QuestionFlow';
import LivePreview from '@/components/preview/LivePreview';
import ExportPanel from '@/components/export/ExportPanel';
import StrictModeToggle from '@/components/ui/StrictModeToggle';
import type { BuilderStep } from '@/store/builderStore';

// ── Steps ──────────────────────────────────────────────────────────────────────
const steps: { id: BuilderStep; label: string; icon: string }[] = [
  { id: 'questions', label: 'Questions', icon: '01' },
  { id: 'preview',   label: 'Preview',   icon: '02' },
  { id: 'export',    label: 'Export',    icon: '03' },
];

// ── Step Indicator ─────────────────────────────────────────────────────────────
function StepIndicator() {
  const { currentStep, goToStep } = useBuilderStore();
  const { parsedTemplate } = useTemplateStore();
  const currentIdx = steps.findIndex((s) => s.id === currentStep);

  const canNavigateTo = (stepId: BuilderStep) => {
    const stepIdx = steps.findIndex((s) => s.id === stepId);
    if (stepIdx <= currentIdx) return true;
    if (!parsedTemplate) return false;
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
                  background: isActive ? '#FFC107' : isPast ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.08)',
                  color:      isActive ? '#0A0A0A' : isPast ? '#4CAF50'             : 'rgba(255,255,255,0.3)',
                  border:     isActive ? 'none'    : isPast ? '1px solid rgba(76,175,80,0.4)' : '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {isPast ? '✓' : step.icon}
              </div>
              <span
                className="hidden sm:block text-xs font-medium"
                style={{ color: isActive ? '#FFC107' : isPast ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}
              >
                {step.label}
              </span>
            </button>
            {idx < steps.length - 1 && (
              <div className="w-6 h-px mx-1" style={{ background: isPast ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.08)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step Nav Bar (for Preview / Export steps) ──────────────────────────────────
function StepNavBar({ step }: { step: BuilderStep }) {
  const { prevStep, nextStep } = useBuilderStore();
  const isPreview = step === 'preview';
  const isExport  = step === 'export';

  return (
    <div
      className="flex items-center justify-between px-6 py-3 flex-shrink-0"
      style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(10,10,10,0.6)' }}
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={prevStep}
        className="flex items-center gap-2 btn-secondary text-sm"
        style={{ padding: '9px 20px' }}
        id="step-back-btn"
      >
        <ChevronLeft size={15} />
        {isPreview ? 'Back to Questions' : 'Back to Preview'}
      </motion.button>

      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>
        Step {isPreview ? '2' : '3'} of 3
      </span>

      {!isExport && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={nextStep}
          className="flex items-center gap-2 btn-primary text-sm"
          style={{ padding: '9px 20px' }}
          id="step-next-btn"
        >
          Continue to Export
          <ChevronRight size={15} />
        </motion.button>
      )}

      {isExport && (
        <div style={{ width: '140px' }} /> /* spacer */
      )}
    </div>
  );
}

// ── Loading Screen ─────────────────────────────────────────────────────────────
function LoadingScreen({ error, onRetry }: { error?: string | null; onRetry?: () => void }) {
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(229,57,53,0.12)', border: '1px solid rgba(229,57,53,0.3)' }}>
          <span style={{ fontSize: '2rem' }}>⚠️</span>
        </div>
        <div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1.2rem', marginBottom: '0.5rem', color: '#EF5350' }}>
            Failed to Load
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', maxWidth: 400 }}>{error}</p>
        </div>
        <button onClick={onRetry} className="btn-primary" style={{ padding: '10px 24px' }} id="retry-load-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.2)' }}
      >
        <Loader2 size={28} style={{ color: '#FFC107' }} />
      </motion.div>
      <div className="text-center">
        <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Preparing your resume builder...</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>Loading question flow</p>
      </div>
      <div className="progress-bar w-48">
        <div className="progress-fill shimmer-bg" style={{ width: '70%' }} />
      </div>
    </div>
  );
}

// ── Main Builder Page ──────────────────────────────────────────────────────────
export default function BuilderPage() {
  const { currentStep } = useBuilderStore();
  const { parsedTemplate, isParsingTemplate, parseError } = useTemplateStore();
  const { loadDefaultTemplate } = useDefaultTemplate();

  const handleRetry = () => loadDefaultTemplate(true);

  // Loading / error states
  if (isParsingTemplate || (!parsedTemplate && !parseError)) {
    return (
      <div className="flex flex-col h-screen" style={{ background: 'var(--surface)' }}>
        <Header />
        <main className="flex-1 overflow-hidden">
          <LoadingScreen />
        </main>
      </div>
    );
  }

  if (parseError && !parsedTemplate) {
    return (
      <div className="flex flex-col h-screen" style={{ background: 'var(--surface)' }}>
        <Header />
        <main className="flex-1 overflow-hidden">
          <LoadingScreen error={parseError} onRetry={handleRetry} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--surface)' }}>
      <Header />

      <main className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">

          {/* ── QUESTIONS STEP ── two-panel layout */}
          {currentStep === 'questions' && (
            <motion.div
              key="questions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 h-full"
            >
              {/* LEFT: Question flow — full width on mobile, 45% on desktop */}
              <div className="w-full lg:w-[45%] lg:min-w-[360px] lg:max-w-[580px] border-b lg:border-b-0 lg:border-r border-[rgba(255,255,255,0.06)] flex flex-col h-full overflow-hidden p-5"
              >
                <QuestionFlow />
              </div>

              {/* RIGHT: Live preview — hidden on mobile/tablet, shown on desktop */}
              <div className="hidden lg:block lg:flex-1 overflow-hidden bg-[#111] h-full">
                <LivePreview />
              </div>
            </motion.div>
          )}

          {/* ── PREVIEW STEP ── full-screen preview + nav bar */}
          {currentStep === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}
            >
              <div style={{ flex: 1, overflow: 'hidden', background: '#111' }}>
                <LivePreview />
              </div>
              <StepNavBar step="preview" />
            </motion.div>
          )}

          {/* ── EXPORT STEP ── split: preview left + export panel right */}
          {currentStep === 'export' && (
            <motion.div
              key="export"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}
            >
              <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Preview — hidden on mobile/tablet, shown on desktop */}
                <div className="hidden lg:block lg:flex-1 overflow-hidden bg-[#111] border-r border-[rgba(255,255,255,0.06)]">
                  <LivePreview />
                </div>
                {/* Export panel — full width on mobile/tablet, max 420px on desktop */}
                <div className="w-full lg:max-w-[420px] overflow-y-auto p-6">
                  <h2 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.02em', marginBottom: '20px' }}>
                    Generate &amp; <span className="gradient-text">Download</span>
                  </h2>
                  <ExportPanel />
                </div>
              </div>
              <StepNavBar step="export" />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}

// ── Shared Header ──────────────────────────────────────────────────────────────
function Header() {
  return (
    <header
      className="flex-shrink-0"
      style={{
        height: '56px',
        background: 'rgba(10,10,10,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2" title="Back to home">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FFC107, #E53935)' }}>
              <FileText size={13} className="text-black" />
            </div>
            <span className="hidden sm:block text-sm font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
              At Your Hand
            </span>
          </Link>
          <div className="hidden sm:block w-px h-5" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <Link href="/" className="hidden sm:flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            <Home size={12} /> Home
          </Link>
        </div>

        <StepIndicator />
        <StrictModeToggle />
      </div>
    </header>
  );
}
