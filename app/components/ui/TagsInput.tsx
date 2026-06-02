'use client';

/**
 * TagsInput — pill-style tag input.
 * Press Enter or comma to add a tag. Click × to remove.
 */

import { useState, KeyboardEvent, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  minTags?: number;
  disabled?: boolean;
}

export default function TagsInput({
  value,
  onChange,
  placeholder = 'Type and press Enter',
  maxTags = 20,
  disabled = false,
}: TagsInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag) return;
    if (value.includes(tag)) return;
    if (value.length >= maxTags) return;
    onChange([...value, tag]);
    setInput('');
  };

  const removeTag = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div
      className="input-field"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        padding: '8px 12px',
        cursor: 'text',
        minHeight: '48px',
        alignItems: 'center',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <AnimatePresence>
        {value.map((tag, i) => (
          <motion.span
            key={tag + i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(255,193,7,0.15)',
              border: '1px solid rgba(255,193,7,0.3)',
              color: '#FFC107',
              borderRadius: '6px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(255,193,7,0.6)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={11} />
              </button>
            )}
          </motion.span>
        ))}
      </AnimatePresence>
      {!disabled && value.length < maxTags && (
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            const v = e.target.value;
            if (v.endsWith(',')) {
              addTag(v.slice(0, -1));
            } else {
              setInput(v);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '14px',
            flex: 1,
            minWidth: '120px',
          }}
        />
      )}
      <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>
        {value.length}/{maxTags}
      </span>
    </div>
  );
}
