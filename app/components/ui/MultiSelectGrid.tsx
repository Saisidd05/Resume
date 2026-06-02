'use client';

/**
 * MultiSelectGrid — checkbox-style multi-select for soft skills etc.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface MultiSelectGridProps {
  options: string[];
  value: string[];
  onChange: (selected: string[]) => void;
  min?: number;
  max?: number;
}

export default function MultiSelectGrid({
  options,
  value,
  onChange,
  max = 10,
}: MultiSelectGridProps) {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputValue, setCustomInputValue] = useState('');

  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else if (value.length < max) {
      if (opt === 'Others') {
        setShowCustomInput(true);
      } else {
        onChange([...value, opt]);
      }
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customInputValue.trim();
    if (clean && !value.includes(clean) && value.length < max) {
      onChange([...value, clean]);
      setCustomInputValue('');
      setShowCustomInput(false);
    }
  };

  // Render original options plus any custom values
  const allOptions = [...options];
  value.forEach((v) => {
    if (!allOptions.includes(v)) {
      // Insert custom options right before "Others" if it exists, otherwise append
      const othersIdx = allOptions.indexOf('Others');
      if (othersIdx !== -1) {
        allOptions.splice(othersIdx, 0, v);
      } else {
        allOptions.push(v);
      }
    }
  });

  return (
    <div className="space-y-3">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {allOptions.map((opt) => {
          const selected = value.includes(opt);
          const atMax = !selected && value.length >= max;
          const isCustom = !options.includes(opt);

          return (
            <motion.button
              key={opt}
              type="button"
              onClick={() => !atMax && toggle(opt)}
              whileHover={{ scale: atMax ? 1 : 1.03 }}
              whileTap={{ scale: atMax ? 1 : 0.97 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                border: `1px solid ${selected ? 'rgba(255,193,7,0.5)' : 'rgba(255,255,255,0.1)'}`,
                background: selected
                  ? 'rgba(255,193,7,0.12)'
                  : 'rgba(255,255,255,0.03)',
                color: selected ? '#FFC107' : atMax ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
                fontSize: '13px',
                fontWeight: selected ? 600 : 400,
                cursor: atMax ? 'not-allowed' : 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              {selected && <Check size={12} strokeWidth={2.5} />}
              {opt}
              {isCustom && selected && (
                <X
                  size={12}
                  style={{ marginLeft: '4px', opacity: 0.6 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(value.filter((v) => v !== opt));
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Inline custom input */}
      <AnimatePresence>
        {showCustomInput && (
          <motion.form
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            onSubmit={handleAddCustom}
            className="flex gap-2 items-center"
            style={{ maxWidth: '320px' }}
          >
            <input
              type="text"
              value={customInputValue}
              onChange={(e) => setCustomInputValue(e.target.value)}
              placeholder="Type custom skill..."
              className="input-field"
              style={{ padding: '8px 12px', fontSize: '13px' }}
              autoFocus
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '10px' }}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                setCustomInputValue('');
              }}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '13px', borderRadius: '10px' }}
            >
              Cancel
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>
        {value.length} selected · max {max}
      </div>
    </div>
  );
}
