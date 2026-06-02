'use client';

/**
 * LanguageBlock — dynamic list of {language, proficiency} rows.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';

export interface LangEntry {
  language: string;
  proficiency: string;
}

const PROFICIENCY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced', 'Fluent', 'Native'];

interface LanguageBlockProps {
  value: LangEntry[];
  onChange: (entries: LangEntry[]) => void;
}

export default function LanguageBlock({ value, onChange }: LanguageBlockProps) {
  const add = () => {
    onChange([...value, { language: '', proficiency: 'Intermediate' }]);
  };

  const remove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const update = (idx: number, field: keyof LangEntry, val: string) => {
    const next = [...value];
    next[idx] = { ...next[idx], [field]: val };
    onChange(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <AnimatePresence>
        {value.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              value={entry.language}
              onChange={(e) => update(i, 'language', e.target.value)}
              placeholder="Language (e.g. Tamil)"
              className="input-field"
              style={{ flex: 2, padding: '10px 12px' }}
            />
            <select
              value={entry.proficiency}
              onChange={(e) => update(i, 'proficiency', e.target.value)}
              className="input-field"
              style={{ flex: 1, padding: '10px 12px', cursor: 'pointer' }}
            >
              {PROFICIENCY_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => remove(i)}
              style={{
                background: 'rgba(229,57,53,0.08)',
                border: '1px solid rgba(229,57,53,0.2)',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                color: '#EF5350',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <Trash2 size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        type="button"
        onClick={add}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '9px 16px',
          borderRadius: '8px',
          border: '1px dashed rgba(255,193,7,0.3)',
          background: 'rgba(255,193,7,0.04)',
          color: 'rgba(255,193,7,0.7)',
          fontSize: '13px',
          cursor: 'pointer',
          width: 'fit-content',
          fontWeight: 500,
          transition: 'all 0.18s',
        }}
      >
        <Plus size={14} />
        Add Language
      </button>
    </div>
  );
}
