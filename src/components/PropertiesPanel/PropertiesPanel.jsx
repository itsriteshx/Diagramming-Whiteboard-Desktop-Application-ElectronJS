// src/components/PropertiesPanel/PropertiesPanel.jsx
import {
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUpToLine,
  ArrowDownToLine,
  X,
} from 'lucide-react';
import { STROKE_COLORS, FILL_COLORS } from '../../constants/tools';

/**
 * 🌟 Excalidraw Style Left Properties Inspector
 */
export function PropertiesPanel({
  selectedShape,
  updateSelectedShape,
  deleteSelectedShape,
  duplicateSelectedShape,
  bringToFront,
  sendToBack,
  onClose,
}) {
  if (!selectedShape) return null;

  const currentStroke = selectedShape.strokeColor || '#1e1e1e';
  const currentFill = selectedShape.fillColor || 'transparent';
  const currentWidth = selectedShape.strokeWidth || 2;
  const currentStyle = selectedShape.strokeStyle || 'solid';
  const currentOpacity = selectedShape.opacity !== undefined ? selectedShape.opacity : 100;
  const currentFontSize = selectedShape.fontSize || 16;
  const currentAlign = selectedShape.textAlign || 'center';

  return (
    <div className="absolute left-5 top-20 z-20 w-64 max-h-[calc(100vh-120px)] overflow-y-auto bg-white/95 text-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.06)] border border-zinc-200/90 rounded-2xl p-4 backdrop-blur-md flex flex-col gap-4 text-xs select-none animate-in fade-in slide-in-from-left-2 duration-150">
      {/* Header with Title & Close button */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
        <span className="font-semibold text-zinc-700 uppercase tracking-wider text-[11px]">
          {selectedShape.type} Properties
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          title="Deselect (Esc)"
        >
          <X size={14} />
        </button>
      </div>

      {/* 1. Label Input */}
      <div>
        <label className="text-[11px] font-semibold text-zinc-600 mb-1.5 block">Label / Text</label>
        <input
          type="text"
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
          placeholder="Enter text..."
          value={selectedShape.text || ''}
          onChange={(e) => updateSelectedShape({ text: e.target.value })}
        />
      </div>

      {/* 2. Stroke Color */}
      <div>
        <label className="text-[11px] font-semibold text-zinc-600 mb-1.5 block">Stroke</label>
        <div className="flex items-center gap-2 flex-wrap">
          {STROKE_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => updateSelectedShape({ strokeColor: c })}
              style={{ backgroundColor: c }}
              className={`w-6.5 h-6.5 rounded-lg transition-transform cursor-pointer ${
                currentStroke === c
                  ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110 shadow-xs'
                  : 'hover:scale-105'
              }`}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* 3. Background / Fill Color */}
      <div>
        <label className="text-[11px] font-semibold text-zinc-600 mb-1.5 block">Background</label>
        <div className="flex items-center gap-2 flex-wrap">
          {FILL_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => updateSelectedShape({ fillColor: c })}
              style={{
                backgroundColor: c === 'transparent' ? '#ffffff' : c,
              }}
              className={`w-6.5 h-6.5 rounded-lg border border-zinc-200 transition-transform cursor-pointer ${
                c === 'transparent' ? 'relative overflow-hidden' : ''
              } ${
                currentFill === c
                  ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110 shadow-xs'
                  : 'hover:scale-105'
              }`}
              title={c === 'transparent' ? 'Transparent' : c}
            >
              {c === 'transparent' && (
                <div className="absolute inset-0 border-t-2 border-red-500 rotate-45 top-2.5" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Stroke Width */}
      <div>
        <label className="text-[11px] font-semibold text-zinc-600 mb-1.5 block">Stroke width</label>
        <div className="grid grid-cols-3 gap-1 bg-zinc-100 p-1 rounded-xl">
          {[
            { label: 'Thin', val: 1 },
            { label: 'Regular', val: 2 },
            { label: 'Bold', val: 4 },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => updateSelectedShape({ strokeWidth: item.val })}
              className={`py-1.5 rounded-lg font-medium text-center transition-all cursor-pointer ${
                currentWidth === item.val
                  ? 'bg-white shadow-xs text-indigo-600 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Stroke Style (Solid, Dashed, Dotted) */}
      <div>
        <label className="text-[11px] font-semibold text-zinc-600 mb-1.5 block">Stroke style</label>
        <div className="grid grid-cols-3 gap-1 bg-zinc-100 p-1 rounded-xl text-[11px]">
          {[
            { id: 'solid', label: 'Solid' },
            { id: 'dashed', label: 'Dashed' },
            { id: 'dotted', label: 'Dotted' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => updateSelectedShape({ strokeStyle: item.id })}
              className={`py-1.5 rounded-lg font-medium text-center transition-all cursor-pointer ${
                currentStyle === item.id
                  ? 'bg-white shadow-xs text-indigo-600 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Font Size */}
      <div>
        <label className="text-[11px] font-semibold text-zinc-600 mb-1.5 block">Font size</label>
        <div className="grid grid-cols-4 gap-1 bg-zinc-100 p-1 rounded-xl">
          {[
            { label: 'S', val: 14 },
            { label: 'M', val: 18 },
            { label: 'L', val: 24 },
            { label: 'XL', val: 32 },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => updateSelectedShape({ fontSize: item.val })}
              className={`py-1.5 rounded-lg font-medium text-center transition-all cursor-pointer ${
                currentFontSize === item.val
                  ? 'bg-white shadow-xs text-indigo-600 font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 7. Text Align */}
      <div>
        <label className="text-[11px] font-semibold text-zinc-600 mb-1.5 block">Text align</label>
        <div className="grid grid-cols-3 gap-1 bg-zinc-100 p-1 rounded-xl">
          {[
            { id: 'left', icon: AlignLeft },
            { id: 'center', icon: AlignCenter },
            { id: 'right', icon: AlignRight },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => updateSelectedShape({ textAlign: item.id })}
                className={`py-1.5 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                  currentAlign === item.id
                    ? 'bg-white shadow-xs text-indigo-600'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Icon size={15} />
              </button>
            );
          })}
        </div>
      </div>

      {/* 8. Opacity Slider */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-600 mb-1.5">
          <span>Opacity</span>
          <span className="font-mono text-zinc-500">{currentOpacity}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          value={currentOpacity}
          onChange={(e) => updateSelectedShape({ opacity: Number(e.target.value) })}
          className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-zinc-200 rounded-lg"
        />
      </div>

      {/* 9. Layers */}
      <div>
        <label className="text-[11px] font-semibold text-zinc-600 mb-1.5 block">Layers</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={bringToFront}
            className="flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-1.5 rounded-xl transition-colors cursor-pointer"
            title="Bring Forward"
          >
            <ArrowUpToLine size={14} />
            <span>Forward</span>
          </button>
          <button
            onClick={sendToBack}
            className="flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-1.5 rounded-xl transition-colors cursor-pointer"
            title="Send Backward"
          >
            <ArrowDownToLine size={14} />
            <span>Backward</span>
          </button>
        </div>
      </div>

      <div className="w-full h-px bg-zinc-200 my-0.5" />

      {/* 10. Actions (Duplicate & Delete) */}
      <div className="flex items-center gap-2">
        <button
          onClick={duplicateSelectedShape}
          className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-2 rounded-xl transition-colors font-medium cursor-pointer"
        >
          <Copy size={14} />
          <span>Duplicate</span>
        </button>
        <button
          onClick={deleteSelectedShape}
          className="flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-xl transition-colors cursor-pointer"
          title="Delete Shape (Del)"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
