import { useState, useRef, useEffect } from 'react';
import {
  MousePointer2,
  Hand,
  Square,
  Circle,
  Diamond,
  MoveRight,
  Minus,
  Pencil,
  Type,
  Eraser,
  Database,
  Cloud,
  Lock,
  Unlock,
  Triangle,
  Hexagon,
  Star,
  Sigma,
  ChevronDown,
} from 'lucide-react';
import { TOOLS } from '../../constants/tools';

function ParallelogramIcon({ size = 18, strokeWidth = 1.75 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19 L9 5 L19 5 L15 19 Z" />
    </svg>
  );
}

function RightTriangleIcon({ size = 18, strokeWidth = 1.75 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4 L4 20 L20 20 Z" />
      <path d="M4 15 L9 15 L9 20" />
    </svg>
  );
}

function AxisIcon({ size = 18, strokeWidth = 1.75 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12 L21 12" />
      <path d="M12 21 L12 3" />
      <path d="M18 9.5 L21 12 L18 14.5" />
      <path d="M9.5 6 L12 3 L14.5 6" />
    </svg>
  );
}

function TrapezoidIcon({ size = 18, strokeWidth = 1.75 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 6 L17 6 L21 18 L3 18 Z" />
    </svg>
  );
}

function CubeIcon({ size = 18, strokeWidth = 1.75 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 L20 7.5 L20 16.5 L12 21 L4 16.5 L4 7.5 Z" />
      <path d="M12 3 L12 21" />
      <path d="M4 7.5 L12 12 L20 7.5" />
    </svg>
  );
}

function ConeIcon({ size = 18, strokeWidth = 1.75 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 L4 17.5" />
      <path d="M12 3 L20 17.5" />
      <path d="M4 17.5 C4 20 20 20 20 17.5" />
      <path d="M4 17.5 C4 15 20 15 20 17.5" strokeDasharray="3 3" />
    </svg>
  );
}

const MATH_TOOLS = [
  { id: TOOLS.TRIANGLE, label: 'Triangle (G)', icon: Triangle },
  { id: TOOLS.RIGHT_TRIANGLE, label: 'Right Triangle', icon: RightTriangleIcon },
  { id: TOOLS.HEXAGON, label: 'Hexagon (X)', icon: Hexagon },
  { id: TOOLS.PARALLELOGRAM, label: 'Parallelogram (Q)', icon: ParallelogramIcon },
  { id: TOOLS.TRAPEZOID, label: 'Trapezoid', icon: TrapezoidIcon },
  { id: TOOLS.STAR, label: 'Star (K)', icon: Star },
  { id: TOOLS.COORDINATE_AXIS, label: 'X-Y Axis', icon: AxisIcon },
  { id: TOOLS.CUBE, label: '3D Cube', icon: CubeIcon },
  { id: TOOLS.CONE, label: '3D Cone', icon: ConeIcon },
];

export function Toolbar({
  activeTool,
  setActiveTool,
  isToolLocked,
  setIsToolLocked,
}) {
  const [isMathOpen, setIsMathOpen] = useState(false);
  const mathMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mathMenuRef.current && !mathMenuRef.current.contains(e.target)) {
        setIsMathOpen(false);
      }
    };
    if (isMathOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMathOpen]);

  const isMathActive = MATH_TOOLS.some((t) => t.id === activeTool);

  const toolGroups = [
    [
      { id: TOOLS.PAN,    label: 'Hand / Pan (H)',  icon: Hand },
      { id: TOOLS.SELECT, label: 'Selection (V)',    icon: MousePointer2 },
    ],
    [
      { id: TOOLS.RECTANGLE, label: 'Rectangle (R)',  icon: Square },
      { id: TOOLS.DIAMOND,   label: 'Diamond (D)',    icon: Diamond },
      { id: TOOLS.ELLIPSE,   label: 'Ellipse (O)',    icon: Circle },
      { id: TOOLS.ARROW,     label: 'Arrow (A)',      icon: MoveRight },
      { id: TOOLS.LINE,      label: 'Line (L)',       icon: Minus },
    ],
    [
      { id: TOOLS.PEN,    label: 'Draw / Pen (P)', icon: Pencil },
      { id: TOOLS.TEXT,   label: 'Text (T)',        icon: Type },
      { id: TOOLS.ERASER, label: 'Eraser (E)',      icon: Eraser },
    ],
    [
      { id: TOOLS.DATABASE, label: 'Database Node (B)',    icon: Database },
      { id: TOOLS.CLOUD,    label: 'Cloud Architecture (C)', icon: Cloud },
    ],
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center bg-white shadow-[0_10px_25px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] border border-zinc-200/90 rounded-2xl p-1.5 backdrop-blur-md select-none transition-all">
      <button
        onClick={() => setIsToolLocked(!isToolLocked)}
        className={`w-9.5 h-9.5 flex items-center justify-center rounded-xl transition-all ${
          isToolLocked
            ? 'bg-indigo-50 text-indigo-600 font-medium'
            : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
        }`}
        title={isToolLocked ? 'Tool Locked' : 'Tool Unlocked'}
      >
        {isToolLocked ? <Lock size={17} /> : <Unlock size={17} />}
      </button>

      <div className="w-px h-5 bg-zinc-200 mx-1.5" />

      {toolGroups.map((group, groupIdx) => (
        <div key={`group_${groupIdx}`} className="flex items-center gap-1">
          {groupIdx > 0 && <div className="w-px h-5 bg-zinc-200 mx-1.5" />}

          {group.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  setIsMathOpen(false);
                }}
                title={tool.label}
                className={`w-9.5 h-9.5 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-100 text-indigo-700 shadow-xs'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95'
                }`}
              >
                <Icon size={19} strokeWidth={isActive ? 2.2 : 1.75} />
              </button>
            );
          })}
        </div>
      ))}

      <div className="w-px h-5 bg-zinc-200 mx-1.5" />

      {/* Math Geometry Dropdown */}
      <div className="relative" ref={mathMenuRef}>
        <button
          onClick={() => setIsMathOpen(!isMathOpen)}
          className={`h-9.5 px-2.5 flex items-center gap-1.5 rounded-xl transition-all cursor-pointer ${
            isMathActive || isMathOpen
              ? 'bg-indigo-100 text-indigo-700 shadow-xs font-semibold'
              : 'text-zinc-700 hover:bg-zinc-100 active:scale-95'
          }`}
          title="Math & Geometry Tools"
        >
          <Sigma size={18} strokeWidth={isMathActive ? 2.3 : 1.8} />
          <span className="text-xs font-semibold">Math</span>
          <ChevronDown size={13} className={`transition-transform duration-150 ${isMathOpen ? 'rotate-180' : ''}`} />
        </button>

        {isMathOpen && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 bg-white border border-zinc-200 shadow-[0_16px_36px_rgba(0,0,0,0.14),0_2px_8px_rgba(0,0,0,0.06)] rounded-2xl p-2 z-50 flex flex-col gap-1.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
            <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center justify-between border-b border-zinc-100 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Sigma size={12} className="text-indigo-600" />
                <span>Math & Geometry</span>
              </div>
              <span className="text-[10px] font-normal text-zinc-400">9 Tools</span>
            </div>

            <div className="grid grid-cols-2 gap-1 max-h-[300px] overflow-y-auto">
              {MATH_TOOLS.map((m) => {
                const Icon = m.icon;
                const isSelected = activeTool === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveTool(m.id);
                      setIsMathOpen(false);
                    }}
                    title={m.label}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 font-semibold ring-1 ring-indigo-200'
                        : 'hover:bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'bg-zinc-100 text-zinc-600'}`}>
                      <Icon size={15} />
                    </div>
                    <span className="text-[11px] font-medium truncate">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
