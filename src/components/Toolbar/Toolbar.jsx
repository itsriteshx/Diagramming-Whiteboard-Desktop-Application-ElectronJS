// src/components/Toolbar/Toolbar.jsx
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
} from 'lucide-react';
import { TOOLS } from '../../constants/tools';

// Custom SVG icon for Parallelogram (not in Lucide)
function ParallelogramIcon({ size = 19, strokeWidth = 1.75 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19 L9 5 L19 5 L15 19 Z" />
    </svg>
  );
}

/**
 * 🌟 Excalidraw Spacious & Clean Toolbar
 * Day 2: Added Triangle, Hexagon, Parallelogram, Star shapes.
 */
export function Toolbar({
  activeTool,
  setActiveTool,
  isToolLocked,
  setIsToolLocked,
}) {
  const toolGroups = [
    // Group 1: Navigation
    [
      { id: TOOLS.PAN,    label: 'Hand / Pan (H)',  icon: Hand },
      { id: TOOLS.SELECT, label: 'Selection (V)',    icon: MousePointer2 },
    ],
    // Group 2: Basic Shapes
    [
      { id: TOOLS.RECTANGLE, label: 'Rectangle (R)',  icon: Square },
      { id: TOOLS.DIAMOND,   label: 'Diamond (D)',    icon: Diamond },
      { id: TOOLS.ELLIPSE,   label: 'Ellipse (O)',    icon: Circle },
      { id: TOOLS.ARROW,     label: 'Arrow (A)',      icon: MoveRight },
      { id: TOOLS.LINE,      label: 'Line (L)',       icon: Minus },
    ],
    // Group 3: Day 2 — New Geometry Shapes
    [
      { id: TOOLS.TRIANGLE,      label: 'Triangle (G)',      icon: Triangle },
      { id: TOOLS.HEXAGON,       label: 'Hexagon (X)',       icon: Hexagon },
      { id: TOOLS.PARALLELOGRAM, label: 'Parallelogram (Q)', icon: ParallelogramIcon },
      { id: TOOLS.STAR,          label: 'Star (K)',           icon: Star },
    ],
    // Group 4: Freehand, Text & Eraser
    [
      { id: TOOLS.PEN,    label: 'Draw / Pen (P)', icon: Pencil },
      { id: TOOLS.TEXT,   label: 'Text (T)',        icon: Type },
      { id: TOOLS.ERASER, label: 'Eraser (E)',      icon: Eraser },
    ],
    // Group 5: Architecture Elements (Eraser.io)
    [
      { id: TOOLS.DATABASE, label: 'Database Node (B)',    icon: Database },
      { id: TOOLS.CLOUD,    label: 'Cloud Architecture (C)', icon: Cloud },
    ],
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center bg-white shadow-[0_10px_25px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04)] border border-zinc-200/90 rounded-2xl p-1.5 backdrop-blur-md select-none transition-all">
      {/* Tool Lock Button */}
      <button
        onClick={() => setIsToolLocked(!isToolLocked)}
        className={`w-9.5 h-9.5 flex items-center justify-center rounded-xl transition-all ${
          isToolLocked
            ? 'bg-indigo-50 text-indigo-600 font-medium'
            : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
        }`}
        title={isToolLocked ? 'Tool Locked — stays active after draw' : 'Tool Unlocked — returns to Select after draw'}
      >
        {isToolLocked ? <Lock size={17} /> : <Unlock size={17} />}
      </button>

      <div className="w-px h-5 bg-zinc-200 mx-1.5" />

      {/* Tool Groups */}
      {toolGroups.map((group, groupIdx) => (
        <div key={`group_${groupIdx}`} className="flex items-center gap-1">
          {groupIdx > 0 && <div className="w-px h-5 bg-zinc-200 mx-1.5" />}

          {group.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
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
    </div>
  );
}
