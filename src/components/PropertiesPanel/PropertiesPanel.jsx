import { useRef } from 'react';
import {
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartHorizontal,
  AlignEndHorizontal,
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignHorizontalSpaceBetween,
  AlignVerticalSpaceBetween,
  ArrowUpToLine,
  ArrowDownToLine,
  Group,
  Ungroup,
  X,
  Sliders,
  Pipette,
  CheckSquare,
} from 'lucide-react';
import { STROKE_COLORS, FILL_COLORS } from '../../constants/tools';

function Section({ label, extra, children }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          {label}
        </span>
        {extra && <span className="text-[10px] text-zinc-400 font-mono">{extra}</span>}
      </div>
      {children}
    </div>
  );
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div
      className="grid bg-zinc-100/90 p-1 rounded-xl gap-1 border border-zinc-200/50"
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((opt) => {
        const isActive = value === opt.val;
        const Icon = opt.icon;
        return (
          <button
            key={opt.val}
            onClick={() => onChange(opt.val)}
            title={opt.title || opt.label}
            className={`h-7.5 flex items-center justify-center rounded-lg text-[11px] font-medium leading-none transition-all cursor-pointer ${
              isActive
                ? 'bg-white shadow-xs text-indigo-600 font-semibold ring-1 ring-zinc-200/80'
                : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50'
            }`}
          >
            {Icon ? <Icon size={14} /> : opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ColorPaletteRow({ colors, selected, onChange }) {
  const colorInputRef = useRef(null);

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
            className={`w-6 h-6 rounded-lg border transition-all cursor-pointer flex-shrink-0 relative overflow-hidden ${
              isSelected
                ? 'ring-2 ring-indigo-500 ring-offset-1 scale-110 shadow-xs'
                : 'border-zinc-200/80 hover:scale-105'
            }`}
            style={{ backgroundColor: isTransparent ? '#fff' : c }}
          >
            {isTransparent && (
              <>
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-rose-400 rotate-45" />
                </div>
              </>
            )}
          </button>
        );
      })}

      {/* Native Custom Color Picker Trigger */}
      <div className="relative flex-shrink-0">
        <label
          title="Pick Custom Color"
          className="w-6 h-6 rounded-lg border border-dashed border-zinc-300 hover:border-indigo-400 flex items-center justify-center cursor-pointer transition-all hover:scale-105 bg-gradient-to-tr from-indigo-50 via-pink-50 to-amber-50"
        >
          <Pipette size={11} className="text-zinc-600" />
          <input
            ref={colorInputRef}
            type="color"
            value={selected === 'transparent' ? '#ffffff' : selected}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  );
}

export function PropertiesPanel({
  selectedShape,
  selectedShapes = [],
  updateSelectedShape,
  deleteSelectedShape,
  duplicateSelectedShape,
  bringToFront,
  sendToBack,
  groupSelectedShapes,
  ungroupSelectedShapes,
  isSelectionGrouped = false,
  onAlign,
  onDistribute,
  onClose,
  onSelectAll,
  totalShapesCount = 0,
}) {
  const isMulti = selectedShapes.length > 1;
  const target = selectedShape || selectedShapes[0];
  if (!target && !isMulti) return null;

  const isLineType = !isMulti && (target?.type === 'arrow' || target?.type === 'line');
  const isPenType = !isMulti && target?.type === 'pen';
  const isRect = !isMulti && target?.type === 'rectangle';

  const strokeColor = target?.strokeColor || '#0f172a';
  const fillColor = target?.fillColor || 'transparent';
  const strokeWidth = target?.strokeWidth || 2;
  const strokeStyle = target?.strokeStyle || 'solid';
  const cornerRadius = target?.cornerRadius !== undefined ? target?.cornerRadius : 8;
  const fontSize = target?.fontSize || 16;
  const textAlign = target?.textAlign || 'center';
  const opacity = target?.opacity !== undefined ? target?.opacity : 100;

  const titleText = isMulti
    ? isSelectionGrouped
      ? `Group (${selectedShapes.length})`
      : `Selection (${selectedShapes.length})`
    : target?.type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <aside className="absolute right-5 top-4 z-20 w-[270px] max-h-[calc(100vh-80px)] overflow-y-auto bg-white/95 backdrop-blur-xl text-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.14),0_4px_12px_rgba(0,0,0,0.05)] border border-zinc-200/90 rounded-2xl select-none animate-in fade-in slide-in-from-right-3 duration-150">
      {/* Inspector Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Sliders size={12} />
          </div>
          <div>
            <div className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
              {isSelectionGrouped && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
              {titleText}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors cursor-pointer"
          title="Deselect"
        >
          <X size={13} />
        </button>
      </div>

      {/* Multi-selection Grouping Bar */}
      {isMulti && (
        <div className="px-3 pt-3 pb-2 border-b border-zinc-100 bg-zinc-50/30">
          {isSelectionGrouped ? (
            <button
              onClick={ungroupSelectedShapes}
              className="w-full py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Ungroup size={14} className="text-indigo-600" />
                <span>Ungroup Elements</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">⇧⌘G</span>
            </button>
          ) : (
            <button
              onClick={groupSelectedShapes}
              className="w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-semibold flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Group size={14} className="text-indigo-600" />
                <span>Group Items</span>
              </div>
              <span className="text-[10px] text-indigo-400 font-mono">⌘G</span>
            </button>
          )}
        </div>
      )}

      {/* Alignment & Distribution Section */}
      {selectedShapes.length >= 2 && (
        <div className="px-4 py-3 border-b border-zinc-100 flex flex-col gap-2.5 bg-zinc-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Align Objects
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Alt+⇧+Arrows</span>
          </div>
          <div className="grid grid-cols-6 gap-1 bg-zinc-100/80 border border-zinc-200/60 rounded-xl p-1">
            <button
              onClick={() => onAlign && onAlign('left')}
              title="Align Left (Alt+Shift+Left)"
              className="h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-indigo-600 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
            >
              <AlignLeft size={14} />
            </button>
            <button
              onClick={() => onAlign && onAlign('center')}
              title="Align Center Horizontal (Alt+Shift+C)"
              className="h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-indigo-600 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
            >
              <AlignCenterHorizontal size={14} />
            </button>
            <button
              onClick={() => onAlign && onAlign('right')}
              title="Align Right (Alt+Shift+Right)"
              className="h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-indigo-600 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
            >
              <AlignRight size={14} />
            </button>
            <button
              onClick={() => onAlign && onAlign('top')}
              title="Align Top (Alt+Shift+Up)"
              className="h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-indigo-600 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
            >
              <AlignStartHorizontal size={14} />
            </button>
            <button
              onClick={() => onAlign && onAlign('middle')}
              title="Align Middle Vertical (Alt+Shift+M)"
              className="h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-indigo-600 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
            >
              <AlignCenterVertical size={14} />
            </button>
            <button
              onClick={() => onAlign && onAlign('bottom')}
              title="Align Bottom (Alt+Shift+Down)"
              className="h-7 flex items-center justify-center rounded-lg text-zinc-600 hover:text-indigo-600 hover:bg-white hover:shadow-xs transition-all cursor-pointer"
            >
              <AlignEndHorizontal size={14} />
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Distribute
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onDistribute && onDistribute('horizontal')}
                disabled={selectedShapes.length < 3}
                title={selectedShapes.length < 3 ? 'Select 3+ shapes to distribute horizontally' : 'Distribute Horizontally (Alt+Shift+H)'}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                  selectedShapes.length >= 3
                    ? 'bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-700 cursor-pointer'
                    : 'bg-zinc-50 text-zinc-300 cursor-not-allowed'
                }`}
              >
                <AlignHorizontalSpaceBetween size={13} />
                <span>Horiz</span>
              </button>
              <button
                onClick={() => onDistribute && onDistribute('vertical')}
                disabled={selectedShapes.length < 3}
                title={selectedShapes.length < 3 ? 'Select 3+ shapes to distribute vertically' : 'Distribute Vertically (Alt+Shift+V)'}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                  selectedShapes.length >= 3
                    ? 'bg-zinc-100 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-700 cursor-pointer'
                    : 'bg-zinc-50 text-zinc-300 cursor-not-allowed'
                }`}
              >
                <AlignVerticalSpaceBetween size={13} />
                <span>Vert</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Properties Form */}
      <div className="flex flex-col gap-4.5 px-4 py-4">
        {/* Label input */}
        {!isMulti && !isPenType && (
          <Section label="Card / Shape Label">
            <input
              type="text"
              className="w-full bg-zinc-50/80 border border-zinc-200 rounded-xl px-3 py-2 text-[12px] text-zinc-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-zinc-300"
              placeholder="Enter shape text…"
              value={target?.text || ''}
              onChange={(e) => updateSelectedShape({ text: e.target.value })}
            />
          </Section>
        )}

        {/* Stroke Color */}
        <Section label="Stroke Color" extra={strokeColor}>
          <ColorPaletteRow
            colors={STROKE_COLORS}
            selected={strokeColor}
            onChange={(c) => updateSelectedShape({ strokeColor: c })}
          />
        </Section>

        {/* Fill Color */}
        {!isLineType && !isPenType && (
          <Section label="Fill Color" extra={fillColor}>
            <ColorPaletteRow
              colors={FILL_COLORS}
              selected={fillColor}
              onChange={(c) => updateSelectedShape({ fillColor: c })}
              transparent
            />
          </Section>
        )}

        {/* Stroke Weight */}
        <Section label="Stroke Weight">
          <SegmentedControl
            value={strokeWidth}
            onChange={(v) => updateSelectedShape({ strokeWidth: v })}
            options={[
              { val: 1, label: '1px Thin' },
              { val: 2, label: '2px Normal' },
              { val: 4, label: '4px Bold' },
            ]}
          />
        </Section>

        {/* Stroke Style */}
        <Section label="Border Style">
          <SegmentedControl
            value={strokeStyle}
            onChange={(v) => updateSelectedShape({ strokeStyle: v })}
            options={[
              { val: 'solid', label: 'Solid' },
              { val: 'dashed', label: 'Dashed' },
              { val: 'dotted', label: 'Dotted' },
            ]}
          />
        </Section>

        {/* Corner Radius (for Rectangle) */}
        {isRect && (
          <Section label="Corner Radius">
            <SegmentedControl
              value={cornerRadius}
              onChange={(v) => updateSelectedShape({ cornerRadius: v })}
              options={[
                { val: 0, label: 'Sharp' },
                { val: 8, label: 'Smooth' },
                { val: 16, label: 'Round' },
                { val: 999, label: 'Pill' },
              ]}
            />
          </Section>
        )}

        {/* Typography */}
        {!isMulti && !isLineType && !isPenType && (
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
                  { val: 'left', icon: AlignLeft, title: 'Align Left' },
                  { val: 'center', icon: AlignCenter, title: 'Align Center' },
                  { val: 'right', icon: AlignRight, title: 'Align Right' },
                ]}
              />
            </Section>
          </>
        )}

        {/* Opacity */}
        <Section label="Opacity" extra={`${opacity}%`}>
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

        {/* Layer Ordering */}
        <Section label="Arrange Layers">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={bringToFront}
              className="flex items-center justify-center gap-1.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-[11px] font-medium transition-colors cursor-pointer"
            >
              <ArrowUpToLine size={13} />
              Bring Forward
            </button>
            <button
              onClick={sendToBack}
              className="flex items-center justify-center gap-1.5 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-[11px] font-medium transition-colors cursor-pointer"
            >
              <ArrowDownToLine size={13} />
              Send Backward
            </button>
          </div>
        </Section>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col gap-2 px-4 py-3 border-t border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center gap-2">
          {onSelectAll && selectedShapes.length < totalShapesCount && totalShapesCount > 1 && (
            <button
              onClick={onSelectAll}
              className="h-9 px-2.5 flex items-center justify-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-[11px] font-medium transition-colors cursor-pointer"
              title="Select All Elements on Canvas (Cmd+A)"
            >
              <CheckSquare size={13} className="text-indigo-600" />
              <span>Select All</span>
            </button>
          )}
          <button
            onClick={duplicateSelectedShape}
            className="h-9 flex-1 flex items-center justify-center gap-1.5 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-zinc-700 border border-zinc-200 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
            title="Duplicate Selected (Cmd+D)"
          >
            <Copy size={13} />
            <span>Duplicate</span>
          </button>
        </div>

        <button
          onClick={deleteSelectedShape}
          className="h-9 w-full flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-600 rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
          title="Delete Selected Elements (Backspace / Delete)"
        >
          <Trash2 size={13} />
          <span>
            {selectedShapes.length === totalShapesCount && totalShapesCount > 1
              ? `Delete All Elements (${selectedShapes.length})`
              : selectedShapes.length > 1
              ? `Delete All Selected (${selectedShapes.length})`
              : 'Delete Element (Backspace)'}
          </span>
        </button>
      </div>
    </aside>
  );
}
