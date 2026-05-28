'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, AlertTriangle, X } from 'lucide-react';
import { useBuilderStore } from '@/store/builderStore';

export default function StrictModeToggle() {
  const { strictMode, setStrictMode, setStrictModeWarningShown, strictModeWarningShown } =
    useBuilderStore();
  const [showWarning, setShowWarning] = useState(false);

  const handleToggle = () => {
    if (strictMode && !strictModeWarningShown) {
      setShowWarning(true);
    } else {
      setStrictMode(!strictMode);
    }
  };

  const confirmDisable = () => {
    setStrictModeWarningShown();
    setStrictMode(false);
    setShowWarning(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        id="strict-mode-toggle"
        className="flex items-center gap-2"
        title={strictMode ? 'Strict mode is ON — click to toggle' : 'Strict mode is OFF'}
      >
        <div
          className="relative w-9 h-5 rounded-full transition-all duration-300"
          style={{ background: strictMode ? '#E53935' : 'rgba(255,255,255,0.15)' }}
        >
          <motion.div
            layout
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
            style={{ left: strictMode ? '18px' : '2px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </div>
        {strictMode ? (
          <Lock size={13} style={{ color: '#EF5350' }} />
        ) : (
          <Unlock size={13} style={{ color: 'rgba(255,255,255,0.4)' }} />
        )}
        <span
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: strictMode ? '#EF5350' : 'rgba(255,255,255,0.4)',
          }}
        >
          Strict Mode
        </span>
      </button>

      {/* Warning modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute right-0 top-8 w-72 rounded-2xl p-5 z-50"
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(229,57,53,0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            <button
              onClick={() => setShowWarning(false)}
              className="absolute top-3 right-3"
              style={{ color: 'rgba(255,255,255,0.3)' }}
            >
              <X size={14} />
            </button>

            <div className="flex items-start gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.3)' }}
              >
                <AlertTriangle size={18} style={{ color: '#E53935' }} />
              </div>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  Disable Strict Mode?
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                  Template constraints will no longer be enforced. The output may not match your template's intended layout.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 btn-secondary text-sm"
                style={{ padding: '8px' }}
              >
                Keep Strict Mode
              </button>
              <button
                onClick={confirmDisable}
                className="flex-1 btn-danger text-sm"
                style={{ padding: '8px' }}
                id="confirm-disable-strict"
              >
                Disable
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
