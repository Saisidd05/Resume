'use client';

import { motion } from 'framer-motion';
import {
  Printer,
  FileCode,
  Trash2
} from 'lucide-react';
import { useTemplateStore } from '@/store/templateStore';

export default function ExportPanel() {
  const { answers, clearAllAnswers } = useTemplateStore();

  const answeredCount = Object.values(answers).filter((a) => a.value?.trim()).length;

  const handlePrint = () => {
    const resumeEl = document.querySelector('.resume-print-target');
    if (!resumeEl) {
      alert('Resume content not found. Please fill in some details first.');
      return;
    }

    // Find or create the print mount root
    let printRoot = document.getElementById('print-mount-root');
    if (!printRoot) {
      printRoot = document.createElement('div');
      printRoot.id = 'print-mount-root';
      document.body.appendChild(printRoot);
    }

    // Copy content
    printRoot.innerHTML = resumeEl.innerHTML;

    // Add printing class to body
    document.body.classList.add('printing');

    // Trigger print
    window.print();

    // Remove class and clean content after a small delay
    setTimeout(() => {
      document.body.classList.remove('printing');
      if (printRoot) {
        printRoot.innerHTML = '';
      }
    }, 500);
  };

  const handleDownloadHTML = () => {
    const resumeEl = document.querySelector('.resume-print-target');
    if (!resumeEl) {
      alert('Resume content not found. Please fill in some details first.');
      return;
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${answers['pi_full_name']?.value || 'Resume'}</title>
  <style>
    body {
      background: #f5f5f5;
      margin: 0;
      padding: 40px 20px;
      font-family: "Calibri", "Arial", sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .resume-container {
      background: white;
      max-width: 700px;
      margin: 0 auto;
      padding: 40px 48px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      font-size: 11px;
      color: #1a1a1a;
      line-height: 1.45;
      box-sizing: border-box;
    }
    /* Typography */
    h1, h2, h3, h4 {
      margin: 0;
    }
    p {
      margin: 0 0 6px 0;
    }
    /* Section Headings */
    .section-heading {
      font-size: 11px;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-bottom: 1.5px solid #333;
      padding-bottom: 3px;
      margin-bottom: 8px;
      margin-top: 16px;
    }
    /* Tag Pills */
    .tag-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 4px;
    }
    .tag-pill {
      background: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 1px 7px;
      font-size: 10px;
      color: #333;
    }
    /* Lists */
    ul {
      margin: 0 0 0 16px;
      padding: 0;
    }
    li {
      margin-bottom: 2px;
      color: #333;
    }
    /* Print override */
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .resume-container {
        box-shadow: none;
        padding: 0;
        max-width: 100%;
        min-height: 0;
      }
    }
  </style>
</head>
<body>
  <div class="resume-container">
    ${resumeEl.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(answers['pi_full_name']?.value || 'resume').toLowerCase().replace(/\s+/g, '_')}_resume.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all your answers? This cannot be undone.')) {
      clearAllAnswers();
      // force reload to clear local state properly
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Section: Status / Export Actions ── */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <h3
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 700,
            fontSize: '1rem',
            color: 'white',
          }}
        >
          Export &amp; Download Options
        </h3>

        <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex justify-between items-center text-xs">
            <span style={{ color: 'rgba(255,255,255,0.45)' }}>Progress Metrics</span>
            <span className="font-bold text-yellow-400">{answeredCount} fields filled</span>
          </div>
          <div className="progress-bar w-full mt-2">
            <div className="progress-fill" style={{ width: `${Math.min(100, (answeredCount / 15) * 100)}%` }} />
          </div>
        </div>

        {/* 1. Download PDF (Print) */}
        <div className="space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            id="download-pdf-btn"
            className="w-full btn-primary flex items-center justify-center gap-3"
            style={{ padding: '13px', fontSize: '14px' }}
          >
            <Printer size={18} />
            Download PDF (via Print)
          </motion.button>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.72rem', lineHeight: 1.4, padding: '0 4px' }}>
            💡 <strong>Tip:</strong> In the print popup, set Destination to <strong>Save as PDF</strong>. Under "More settings", set Margins to <strong>None</strong> and enable <strong>Background graphics</strong>.
          </p>
        </div>

        {/* 2. Download HTML */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownloadHTML}
          id="download-html-btn"
          className="w-full btn-secondary flex items-center justify-center gap-3"
          style={{ padding: '12px', fontSize: '14px' }}
        >
          <FileCode size={18} />
          Download HTML Web Page
        </motion.button>
      </div>

      {/* ── Section: Clear Data ── */}
      <div
        className="rounded-xl p-4 flex items-center justify-between"
        style={{ background: 'rgba(229,57,53,0.04)', border: '1px solid rgba(229,57,53,0.1)' }}
      >
        <div>
          <h4 style={{ fontWeight: 600, fontSize: '0.85rem', color: '#EF5350' }}>Reset Data</h4>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem', marginTop: '2px' }}>
            Delete all current answers from local storage.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReset}
          id="reset-answers-btn"
          className="btn-danger"
          style={{ padding: '8px 16px', fontSize: '12px' }}
        >
          <Trash2 size={13} className="inline mr-1" />
          Reset
        </motion.button>
      </div>
    </div>
  );
}
