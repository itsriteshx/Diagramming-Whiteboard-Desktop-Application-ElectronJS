import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Image as ImageIcon,
  Code2,
  FileText,
  Save,
  Layers,
  Sparkles,
} from 'lucide-react';
import { renderShapesToCanvas } from '../../utils/exportCanvas';
import { exportShapesToSvg } from '../../utils/exportSvg';

export function ExportModal({
  isOpen,
  onClose,
  shapes = [],
  selectedIds = [],
  docName = 'Diagram',
  docsContent = '',
  canvasBg = { color: '#ffffff' },
}) {
  const [format, setFormat] = useState('png'); // 'png' | 'svg' | 'md' | 'json'
  const [scale, setScale] = useState(2); // 1, 2, 3, 4
  const [transparent, setTransparent] = useState(false);
  const [padding, setPadding] = useState(24); // 12, 24, 48
  const [scope, setScope] = useState('all'); // 'all' | 'selected'
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const selectedShapesCount = selectedIds.length;

  const targetShapes = useMemo(() => {
    if (scope === 'selected' && selectedShapesCount > 0) {
      return shapes.filter((s) => selectedIds.includes(s.id));
    }
    return shapes;
  }, [shapes, selectedIds, scope, selectedShapesCount]);

  // Generate live preview data URL
  const previewData = useMemo(() => {
    if (!isOpen || targetShapes.length === 0) return null;
    try {
      return renderShapesToCanvas(targetShapes, {
        scale: 1,
        padding,
        transparent,
        canvasBg,
      });
    } catch {
      return null;
    }
  }, [isOpen, targetShapes, padding, transparent, canvasBg]);

  // Estimate full export resolution
  const exportResolution = useMemo(() => {
    if (!previewData?.box) return { width: 0, height: 0 };
    return {
      width: Math.round(previewData.box.width * scale),
      height: Math.round(previewData.box.height * scale),
    };
  }, [previewData, scale]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const safeFilename = docName.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-');

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      if (format === 'png') {
        const result = renderShapesToCanvas(targetShapes, {
          scale,
          padding,
          transparent,
          canvasBg,
        });

        if (!result) return;

        if (window.electronAPI?.saveImage) {
          await window.electronAPI.saveImage(result.dataUrl, `${safeFilename}-${scale}x.png`);
        } else {
          const a = document.createElement('a');
          a.href = result.dataUrl;
          a.download = `${safeFilename}-${scale}x.png`;
          a.click();
        }
      } else if (format === 'svg') {
        const { svgString } = exportShapesToSvg(targetShapes, {
          padding,
          transparent,
          canvasBg,
        });

        if (window.electronAPI?.saveSvg) {
          await window.electronAPI.saveSvg(svgString, `${safeFilename}.svg`);
        } else {
          const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${safeFilename}.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else if (format === 'md') {
        if (window.electronAPI?.saveMarkdown) {
          await window.electronAPI.saveMarkdown(docsContent, `${safeFilename}-docs.md`);
        } else {
          const blob = new Blob([docsContent], { type: 'text/markdown;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${safeFilename}-docs.md`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else if (format === 'json') {
        const projectData = JSON.stringify(
          {
            docName,
            version: '1.0.0',
            canvasBg: canvasBg.id,
            shapes: targetShapes,
            docsContent,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        );

        if (window.electronAPI?.saveFile) {
          await window.electronAPI.saveFile(projectData, `${safeFilename}.eraser`, null, true);
        } else {
          const blob = new Blob([projectData], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${safeFilename}.eraser`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    setIsExporting(true);
    try {
      if (format === 'png') {
        const result = renderShapesToCanvas(targetShapes, {
          scale: Math.min(scale, 2), // 2x max for clipboard buffer
          padding,
          transparent,
          canvasBg,
        });

        if (result && window.electronAPI?.copyImageToClipboard) {
          await window.electronAPI.copyImageToClipboard(result.dataUrl);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else if (result?.canvas) {
          result.canvas.toBlob((blob) => {
            if (blob) {
              navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            }
          });
        }
      } else if (format === 'svg') {
        const { svgString } = exportShapesToSvg(targetShapes, {
          padding,
          transparent,
          canvasBg,
        });

        if (window.electronAPI?.copyTextToClipboard) {
          await window.electronAPI.copyTextToClipboard(svgString);
        } else {
          await navigator.clipboard.writeText(svgString);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else if (format === 'md') {
        if (window.electronAPI?.copyTextToClipboard) {
          await window.electronAPI.copyTextToClipboard(docsContent);
        } else {
          await navigator.clipboard.writeText(docsContent);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-3xl bg-white border border-zinc-200 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Download size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                Export Diagram & Docs
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-200/70 text-zinc-700">
                  {targetShapes.length} shapes
                </span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Generate high-resolution PNG, Scalable Vector SVG, or Markdown technical specifications.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
          {/* Left: Preview Card */}
          <div className="flex-1 flex flex-col">
            <div className="text-xs font-semibold text-zinc-700 mb-2 flex items-center justify-between">
              <span>Preview</span>
              {format === 'png' && (
                <span className="text-[11px] font-mono text-zinc-400">
                  {exportResolution.width} × {exportResolution.height} px ({scale}x)
                </span>
              )}
            </div>

            <div
              className={`relative flex-1 min-h-[220px] max-h-[300px] rounded-xl border border-zinc-200 overflow-hidden flex items-center justify-center p-3 transition-colors ${
                transparent ? 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:12px_12px] bg-white' : ''
              }`}
              style={{
                backgroundColor: transparent ? undefined : canvasBg?.color || '#ffffff',
              }}
            >
              {previewData?.dataUrl ? (
                <img
                  src={previewData.dataUrl}
                  alt="Export preview"
                  className="max-w-full max-h-full object-contain rounded drop-shadow-xs"
                />
              ) : format === 'md' ? (
                <div className="w-full h-full p-3 font-mono text-xs text-zinc-600 bg-zinc-50 rounded-lg overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{docsContent.slice(0, 400)}...</pre>
                </div>
              ) : (
                <div className="text-xs text-zinc-400 flex flex-col items-center gap-1.5">
                  <Layers size={24} />
                  <span>No shapes on canvas to export</span>
                </div>
              )}
            </div>

            {/* Scope Selector if elements are selected */}
            {selectedShapesCount > 0 && (
              <div className="mt-3 flex items-center gap-2 p-1 bg-zinc-100 rounded-xl">
                <button
                  onClick={() => setScope('all')}
                  className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    scope === 'all'
                      ? 'bg-white text-zinc-900 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Entire Whiteboard ({shapes.length})
                </button>
                <button
                  onClick={() => setScope('selected')}
                  className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    scope === 'selected'
                      ? 'bg-white text-indigo-600 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  Selected Only ({selectedShapesCount})
                </button>
              </div>
            )}
          </div>

          {/* Right: Export Controls */}
          <div className="w-full md:w-72 flex flex-col gap-4">
            {/* Format Selector */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                Export Format
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'png', label: 'PNG Image', icon: <ImageIcon size={14} /> },
                  { id: 'svg', label: 'Vector SVG', icon: <Code2 size={14} /> },
                  { id: 'md', label: 'Markdown .md', icon: <FileText size={14} /> },
                  { id: 'json', label: 'Project .eraser', icon: <Save size={14} /> },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      format === fmt.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    {fmt.icon}
                    <span>{fmt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* PNG Resolution Selector */}
            {format === 'png' && (
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1.5">
                  Resolution Scale
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { val: 1, label: '1x', desc: 'Std' },
                    { val: 2, label: '2x', desc: 'Retina' },
                    { val: 3, label: '3x', desc: 'High' },
                    { val: 4, label: '4x', desc: '4K' },
                  ].map((s) => (
                    <button
                      key={s.val}
                      onClick={() => setScale(s.val)}
                      className={`flex flex-col items-center py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                        scale === s.val
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                          : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      <span>{s.label}</span>
                      <span className={`text-[10px] ${scale === s.val ? 'text-indigo-200' : 'text-zinc-400'}`}>
                        {s.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Background & Padding Options */}
            {(format === 'png' || format === 'svg') && (
              <div className="flex flex-col gap-2.5 pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-700 font-medium">Transparent Background</span>
                  <button
                    onClick={() => setTransparent(!transparent)}
                    className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                      transparent ? 'bg-indigo-600' : 'bg-zinc-300'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        transparent ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <span className="text-xs text-zinc-700 font-medium block mb-1">Canvas Padding</span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { val: 12, label: '12px' },
                      { val: 24, label: '24px' },
                      { val: 48, label: '48px' },
                    ].map((p) => (
                      <button
                        key={p.val}
                        onClick={() => setPadding(p.val)}
                        className={`py-1 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                          padding === p.val
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-3.5 bg-zinc-50/80 border-t border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Sparkles size={14} className="text-indigo-500" />
            <span>
              {format === 'svg'
                ? 'Scalable vector format for Figma, Illustrator, or web'
                : format === 'png'
                ? 'High-density pixel rasterization'
                : 'Standalone technical documentation specification'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {(format === 'png' || format === 'svg' || format === 'md') && (
              <button
                onClick={handleCopyToClipboard}
                disabled={isExporting || targetShapes.length === 0}
                className="h-8 flex items-center gap-1.5 px-3 rounded-xl border border-zinc-200 hover:bg-white text-zinc-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                title="Copy directly to clipboard"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : format === 'svg' ? 'Copy SVG' : 'Copy Image'}</span>
              </button>
            )}

            <button
              onClick={handleDownload}
              disabled={isExporting || (format !== 'md' && targetShapes.length === 0)}
              className="h-8 flex items-center gap-1.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download size={14} />
              <span>Download {format.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
