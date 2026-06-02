'use client';

/**
 * MultiSelectGrid — checkbox-style multi-select for soft skills etc.
 */

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

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
  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else if (value.length < max) {
      onChange([...value, opt]);
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map((opt) => {
        const selected = value.includes(opt);
        const atMax = !selected && value.length >= max;
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
          </motion.button>
        );
      })}
      <div style={{ width: '100%', fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '4px' }}>
        {value.length} selected · max {max}
      </div>
    </div>
  );
}
