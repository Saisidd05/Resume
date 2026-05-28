'use client';

import { motion } from 'framer-motion';
import { Eye, EyeOff, Maximize2 } from 'lucide-react';
import { useBuilderStore } from '@/store/builderStore';
import TemplateRenderer from './TemplateRenderer';

export default function LivePreview() {
  const { previewVisible, setPreviewVisible } = useBuilderStore();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#4CAF50' }}
          />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
            Live Preview
          </span>
          <span
            className="px-2 py-0.5 rounded text-xs"
            style={{ background: 'rgba(255,193,7,0.1)', color: '#FFC107', fontSize: '10px', fontWeight: 600 }}
          >
            Real-time
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewVisible(!previewVisible)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            title={previewVisible ? 'Hide preview' : 'Show preview'}
          >
            {previewVisible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-hidden">
        {previewVisible ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full preview-container"
          >
            <TemplateRenderer />
          </motion.div>
        ) : (
          <div
            className="h-full flex flex-col items-center justify-center gap-3 cursor-pointer"
            style={{ color: 'rgba(255,255,255,0.2)' }}
            onClick={() => setPreviewVisible(true)}
          >
            <Eye size={32} />
            <p style={{ fontSize: '0.875rem' }}>Click to show preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
