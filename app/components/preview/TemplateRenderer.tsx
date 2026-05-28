'use client';

import { useEffect, useRef, useState } from 'react';
import { useTemplateStore } from '@/store/templateStore';

/**
 * TemplateRenderer — renders the uploaded template with user answers overlaid.
 * 
 * For PDF: uses pdfjs-dist to render the original template to canvas,
 *          then overlays answered text at exact bounding box positions.
 * For DOCX: uses mammoth to convert to HTML, then injects answered content.
 * 
 * This gives a live preview that matches the template's exact visual appearance.
 */
export default function TemplateRenderer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const { parsedTemplate, uploadedFileUrl, answers } = useTemplateStore();

  // Re-render whenever answers change
  useEffect(() => {
    if (!uploadedFileUrl || !parsedTemplate) return;

    if (parsedTemplate.file_type === 'pdf') {
      renderPDF();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, uploadedFileUrl, parsedTemplate]);

  async function renderPDF() {
    if (!canvasRef.current || !uploadedFileUrl) return;

    setIsRendering(true);
    setError(null);

    try {
      // Dynamic import to avoid SSR issues
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const response = await fetch(uploadedFileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const page = await pdf.getPage(1);
      const scale = 1.5;
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render the original PDF page
      await page.render({ canvasContext: ctx, viewport }).promise;

      // Overlay answers at placeholder positions
      if (parsedTemplate?.all_placeholders) {
        for (const ph of parsedTemplate.all_placeholders) {
          if (!ph.bbox) continue;

          const ans = Object.values(answers).find(
            (a) => a.field_id.toLowerCase().includes(ph.label.toLowerCase().replace(/\s/g, '_'))
          );

          if (!ans?.value?.trim()) continue;

          // Cover old text
          const x = ph.bbox.x0 * scale;
          const y = ph.bbox.y0 * scale;
          const w = (ph.bbox.x1 - ph.bbox.x0) * scale + 60;
          const h = (ph.bbox.y1 - ph.bbox.y0) * scale + 8;

          ctx.fillStyle = 'white';
          ctx.fillRect(x, y, w, h);

          // Draw new text
          const fontSize = ph.font.size * scale;
          ctx.font = `${ph.font.italic ? 'italic ' : ''}${ph.font.bold ? 'bold ' : ''}${fontSize}px "${ph.font.name}", Helvetica, Arial`;
          ctx.fillStyle = ph.font.color || '#000000';

          const lines = ans.value.split('\n');
          let lineY = y + fontSize;
          for (const line of lines) {
            ctx.fillText(line.trim(), x, lineY);
            lineY += fontSize * 1.4;
          }
        }
      }
    } catch (e: any) {
      setError('Preview unavailable: ' + e.message);
      console.error('PDF render error:', e);
    } finally {
      setIsRendering(false);
    }
  }

  if (!uploadedFileUrl) {
    return (
      <div
        className="flex flex-col items-center justify-center h-full gap-3"
        style={{ color: 'rgba(255,255,255,0.2)' }}
      >
        <div style={{ fontSize: '48px' }}>📄</div>
        <p style={{ fontSize: '0.875rem' }}>Upload a template to see the preview</p>
      </div>
    );
  }

  if (parsedTemplate?.file_type === 'docx') {
    // For DOCX, show a styled placeholder message since
    // client-side mammoth rendering is handled separately
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 p-8 text-center">
        <div style={{ fontSize: '48px' }}>📝</div>
        <p style={{ fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
          DOCX Template Loaded
        </p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>
          Live preview is available for PDF templates. DOCX will render correctly in the exported file.
        </p>
        {/* Show answered fields list */}
        <div className="mt-4 w-full max-w-xs">
          {Object.values(answers).filter(a => a.value.trim()).map((ans) => (
            <div
              key={ans.field_id}
              className="flex items-start gap-2 mb-2 text-left"
              style={{ fontSize: '0.8rem' }}
            >
              <span style={{ color: '#4CAF50', flexShrink: 0 }}>✓</span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                {ans.field_id.split('_').slice(2).join(' ').replace(/_/g, ' ')}:{' '}
                <span style={{ color: 'rgba(255,255,255,0.75)' }}>
                  {ans.value.substring(0, 40)}{ans.value.length > 40 ? '...' : ''}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-auto">
      {isRendering && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ background: 'rgba(10,10,10,0.5)' }}
        >
          <div className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Updating preview...</div>
        </div>
      )}
      {error && (
        <div
          className="absolute top-4 left-4 right-4 px-4 py-3 rounded-xl text-sm z-10"
          style={{ background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.3)', color: '#EF5350' }}
        >
          {error}
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', display: 'block' }}
      />
    </div>
  );
}
