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

function Section({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
        {label}
      </span>
      {children}
    </div>
  );
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="grid bg-zinc-100 rounded-xl p-1 gap-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((opt) => {
        const isActive = value === opt.val;
        const Icon = opt.icon;
        return (
          <button
            key={opt.val}
            onClick={() => onChange(opt.val)}
            title={opt.title}
            className={`py-1.5 flex items-center justify-center rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              isActive
                ? 'bg-white shadow-sm text-indigo-600 font-semibold'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {Icon ? <Icon size={14} /> : opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ColorRow({ colors, selected, onChange, transparent }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {colors.map((c) => {
        const isTransparent = c === 'transparent';
        const isSelected = selected === c;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            title={isTransparent ? 'Transparent / None' : c}
            className={`w-7 h-7 rounded-lg border transition-all cursor-pointer flex-shrink-0 relative overflow-hidden ${
              isSelected
                ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110'
                : 'border-zinc-200 hover:scale-105'
            }`}
            style={{ backgroundColor: isTransparent ? '#fff' : c }}
          >
            {isTransparent && (
              <>
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-red-400 rotate-45" />
                </div>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

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

  const isLineType = selectedShape.type === 'arrow' || selectedShape.type === 'line';
  const isPenType  = selectedShape.type === 'pen';

  const strokeColor  = selectedShape.strokeColor  || '#1e1e1e';
  const fillColor    = selectedShape.fillColor    || 'transparent';
  const strokeWidth  = selectedShape.strokeWidth  || 2;
  const strokeStyle  = selectedShape.strokeStyle  || 'solid';
  const fontSize     = selectedShape.fontSize     || 16;
  const textAlign    = selectedShape.textAlign    || 'center';
  const opacity      = selectedShape.opacity !== undefined ? selectedShape.opacity : 100;

  const typeName = selectedShape.type.charAt(0).toUpperCase() + selectedShape.type.slice(1);

  return (
    <div className="absolute left-4 top-[72px] z-20 w-[230px] max-h-[calc(100vh-100px)] overflow-y-auto bg-white text-zinc-800 shadow-[0_12px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] border border-zinc-200 rounded-2xl backdrop-blur-md select-none">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
          {typeName}
        </span>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          title="Deselect"
        >
          <X size={13} />
        </button>
      </div>

      <div className="flex flex-col gap-5 px-4 py-4">
        {!isPenType && (
          <Section label="Label">
            <input
              type="text"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-[12px] text-zinc-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-zinc-300"
              placeholder="Add a label…"
              value={selectedShape.text || ''}
              onChange={(e) => updateSelectedShape({ text: e.target.value })}
            />
          </Section>
        )}

        <Section label="Stroke">
          <ColorRow
            colors={STROKE_COLORS}
            selected={strokeColor}
            onChange={(c) => updateSelectedShape({ strokeColor: c })}
          />
        </Section>

        {!isLineType && !isPenType && (
          <Section label="Fill">
            <ColorRow
              colors={FILL_COLORS}
              selected={fillColor}
              onChange={(c) => updateSelectedShape({ fillColor: c })}
              transparent
            />
          </Section>
        )}

        <Section label="Stroke Width">
          <SegmentedControl
            value={strokeWidth}
            onChange={(v) => updateSelectedShape({ strokeWidth: v })}
            options={[
              { val: 1, label: 'Thin' },
              { val: 2, label: 'Regular' },
              { val: 4, label: 'Bold' },
            ]}
          />
        </Section>

        <Section label="Stroke Style">
          <SegmentedControl
            value={strokeStyle}
            onChange={(v) => updateSelectedShape({ strokeStyle: v })}
            options={[
              { val: 'solid',  label: 'Solid' },
              { val: 'dashed', label: 'Dashed' },
              { val: 'dotted', label: 'Dotted' },
            ]}
          />
        </Section>

        {!isLineType && !isPenType && (
          <>
            <Section label="Font Size">
              <SegmentedControl
                value={fontSize}
                onChange={(v) => updateSelectedShape({ fontSize: v })}
                options={[
                  { val: 12, label: 'XS' },
                  { val: 15, label: 'S' },
                  { val: 20, label: 'M' },
                  { val: 28, label: 'L' },
                  { val: 36, label: 'XL' },
                ]}
              />
            </Section>

            <Section label="Text Align">
              <SegmentedControl
                value={textAlign}
                onChange={(v) => updateSelectedShape({ textAlign: v })}
                options={[
                  { val: 'left',   icon: AlignLeft,   title: 'Align Left' },
                  { val: 'center', icon: AlignCenter,  title: 'Align Center' },
                  { val: 'right',  icon: AlignRight,   title: 'Align Right' },
                ]}
              />
            </Section>
          </>
        )}

        <Section label={`Opacity — ${opacity}%`}>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={opacity}
            onChange={(e) => updateSelectedShape({ opacity: Number(e.target.value) })}
            className="w-full h-1.5 rounded-full accent-indigo-600 cursor-pointer bg-zinc-200"
          />
        </Section>

        <Section label="Layers">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={bringToFront}
              className="flex items-center justify-center gap-1.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-[11px] font-medium transition-colors cursor-pointer"
            >
              <ArrowUpToLine size={13} />
              Forward
            </button>
            <button
              onClick={sendToBack}
              className="flex items-center justify-center gap-1.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-[11px] font-medium transition-colors cursor-pointer"
            >
              <ArrowDownToLine size={13} />
              Backward
            </button>
          </div>
        </Section>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-100">
        <button
          onClick={duplicateSelectedShape}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-700 text-zinc-700 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
        >
          <Copy size={13} />
          Duplicate
        </button>
        <button
          onClick={deleteSelectedShape}
          className="w-9 h-9 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-xl transition-colors cursor-pointer"
          title="Delete"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
