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
  StickyNote,
  Server,
  Workflow,
  Shapes,
  Layout,
  Globe,
  RectangleHorizontal,
  FormInput,
  Image,
  ToggleLeft,
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

function LaserIcon({ size = 18, strokeWidth = 1.75 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2.5" fill="#ef4444" stroke="#ef4444" />
      <path d="M12 2 L12 6" stroke="#ef4444" />
      <path d="M12 18 L12 22" stroke="#ef4444" />
      <path d="M2 12 L6 12" stroke="#ef4444" />
      <path d="M18 12 L22 12" stroke="#ef4444" />
      <path d="M4.93 4.93 L7.76 7.76" stroke="#ef4444" />
      <path d="M16.24 16.24 L19.07 19.07" stroke="#ef4444" />
      <path d="M4.93 19.07 L7.76 16.24" stroke="#ef4444" />
      <path d="M16.24 7.76 L19.07 4.93" stroke="#ef4444" />
    </svg>
  );
}

const DOCK_CATEGORIES = [
  {
    id: 'pointer',
    label: 'Pointer',
    icon: MousePointer2,
    tools: [
      { id: TOOLS.SELECT, label: 'Select & Transform', shortcut: 'V', icon: MousePointer2 },
      { id: TOOLS.PAN, label: 'Hand / Pan Canvas', shortcut: 'H', icon: Hand },
      { id: TOOLS.LASER, label: 'Laser Pointer', shortcut: 'W', icon: LaserIcon },
    ],
  },
  {
    id: 'shapes',
    label: 'Shapes',
    icon: Shapes,
    tools: [
      { id: TOOLS.RECTANGLE, label: 'Rectangle', shortcut: 'R', icon: Square },
      { id: TOOLS.DIAMOND, label: 'Decision Diamond', shortcut: 'D', icon: Diamond },
      { id: TOOLS.ELLIPSE, label: 'Ellipse / Circle', shortcut: 'O', icon: Circle },
      { id: TOOLS.TRIANGLE, label: 'Triangle', shortcut: 'G', icon: Triangle },
      { id: TOOLS.HEXAGON, label: 'Hexagon', shortcut: 'X', icon: Hexagon },
      { id: TOOLS.STAR, label: 'Star', shortcut: 'K', icon: Star },
      { id: TOOLS.PARALLELOGRAM, label: 'Parallelogram', shortcut: 'Q', icon: ParallelogramIcon },
      { id: TOOLS.RIGHT_TRIANGLE, label: 'Right Triangle', shortcut: '', icon: RightTriangleIcon },
      { id: TOOLS.TRAPEZOID, label: 'Trapezoid', shortcut: '', icon: TrapezoidIcon },
    ],
  },
  {
    id: 'connectors',
    label: 'Flow',
    icon: Workflow,
    tools: [
      { id: TOOLS.ARROW, label: 'Smart Arrow Connector', shortcut: 'A', icon: MoveRight },
      { id: TOOLS.LINE, label: 'Straight Line', shortcut: 'L', icon: Minus },
    ],
  },
  {
    id: 'architecture',
    label: 'System',
    icon: Server,
    tools: [
      { id: TOOLS.DATABASE, label: 'Database Cylinder', shortcut: 'B', icon: Database },
      { id: TOOLS.CLOUD, label: 'Cloud Infrastructure', shortcut: 'C', icon: Cloud },
      { id: TOOLS.CUBE, label: '3D Cube / Server', shortcut: '', icon: CubeIcon },
      { id: TOOLS.CONE, label: '3D Cone / Gateway', shortcut: '', icon: ConeIcon },
      { id: TOOLS.COORDINATE_AXIS, label: 'X-Y Coordinate Axis', shortcut: '', icon: AxisIcon },
    ],
  },
  {
    id: 'wireframes',
    label: 'Wireframe',
    icon: Layout,
    tools: [
      { id: TOOLS.BROWSER, label: 'Browser App Frame', shortcut: '', icon: Globe },
      { id: TOOLS.UI_BUTTON, label: 'UI Action Button', shortcut: '', icon: RectangleHorizontal },
      { id: TOOLS.UI_INPUT, label: 'Form Input Box', shortcut: '', icon: FormInput },
      { id: TOOLS.IMAGE_PLACEHOLDER, label: 'Image / Media Box', shortcut: '', icon: Image },
      { id: TOOLS.TOGGLE_SWITCH, label: 'Toggle Switch UI', shortcut: '', icon: ToggleLeft },
    ],
  },
  {
    id: 'annotate',
    label: 'Annotate',
    icon: StickyNote,
    tools: [
      { id: TOOLS.PEN, label: 'Freehand Pen', shortcut: 'P', icon: Pencil },
      { id: TOOLS.TEXT, label: 'Text Label', shortcut: 'T', icon: Type },
      { id: TOOLS.ERASER, label: 'Eraser', shortcut: 'E', icon: Eraser },
    ],
  },
];

export function Toolbar({
  activeTool,
  setActiveTool,
  isToolLocked,
  setIsToolLocked,
}) {
  const [openCategory, setOpenCategory] = useState(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpenCategory(null);
      }
    };
    if (openCategory) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openCategory]);

  // Find which category the current tool belongs to
  const getToolCategory = (toolId) => {
    return DOCK_CATEGORIES.find((cat) => cat.tools.some((t) => t.id === toolId));
  };

  const activeCategory = getToolCategory(activeTool);

  // Get primary tool for each category (the active one if it belongs, otherwise first)
  const getCategoryPrimaryTool = (category) => {
    const activeTool_ = category.tools.find((t) => t.id === activeTool);
    if (activeTool_) return activeTool_;
    return category.tools[0];
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 select-none" ref={popoverRef}>
      {/* Popover Panel */}
      {openCategory && (() => {
        const cat = DOCK_CATEGORIES.find((c) => c.id === openCategory);
        if (!cat) return null;
        return (
          <div className="absolute bottom-[66px] left-1/2 -translate-x-1/2 w-72 bg-white/95 backdrop-blur-xl border border-zinc-200/90 shadow-[0_20px_60px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.08)] rounded-2xl p-2 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-150">
            <div className="px-3 py-2 flex items-center justify-between border-b border-zinc-100 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <cat.icon size={12} />
                </div>
                <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">{cat.label}</span>
              </div>
              <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded-full">{cat.tools.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-0.5">
              {cat.tools.map((tool) => {
                const Icon = tool.icon;
                const isActive = activeTool === tool.id;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setActiveTool(tool.id);
                      setOpenCategory(null);
                    }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-indigo-50/90 text-indigo-700'
                        : 'hover:bg-zinc-100/70 text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200 group-hover:text-zinc-800'
                      }`}>
                        <Icon size={15} strokeWidth={isActive ? 2.2 : 1.75} />
                      </div>
                      <span className={`text-xs truncate ${isActive ? 'text-indigo-900 font-semibold' : 'text-zinc-700 font-medium'}`}>
                        {tool.label}
                      </span>
                    </div>
                    {tool.shortcut && (
                      <kbd className={`text-[10px] font-mono px-2 py-0.5 rounded-md border shrink-0 text-center min-w-[20px] ${
                        isActive
                          ? 'bg-indigo-100 border-indigo-200 text-indigo-700 font-bold'
                          : 'bg-zinc-100 border-zinc-200 text-zinc-500 font-medium'
                      }`}>
                        {tool.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Main Floating Dock Bar */}
      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] border border-zinc-200/70 rounded-2xl p-1.5 transition-all">
        {/* Tool Lock Toggle */}
        <button
          onClick={() => setIsToolLocked(!isToolLocked)}
          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
            isToolLocked
              ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
              : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'
          }`}
          title={isToolLocked ? 'Tool Locked — Click to Unlock' : 'Tool Unlocked — Click to Lock'}
        >
          {isToolLocked ? <Lock size={16} /> : <Unlock size={16} />}
        </button>

        <div className="w-px h-6 bg-zinc-200/80 mx-0.5" />

        {/* Category Dock Items */}
        {DOCK_CATEGORIES.map((cat) => {
          const primaryTool = getCategoryPrimaryTool(cat);
          const Icon = primaryTool.icon;
          const isCatActive = activeCategory?.id === cat.id;
          const isPopoverOpen = openCategory === cat.id;

          return (
            <div key={cat.id} className="relative group">
              <button
                onClick={() => {
                  if (cat.tools.length === 1) {
                    setActiveTool(cat.tools[0].id);
                    setOpenCategory(null);
                  } else if (isPopoverOpen) {
                    setOpenCategory(null);
                  } else {
                    if (!isCatActive) {
                      setActiveTool(primaryTool.id);
                    }
                    setOpenCategory(cat.id);
                  }
                }}
                className={`relative w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                  isCatActive
                    ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-800 active:scale-95'
                }`}
                title={`${cat.label}: ${primaryTool.label}`}
              >
                <Icon size={18} strokeWidth={isCatActive ? 2.2 : 1.75} />
                {cat.tools.length > 1 && (
                  <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                    isCatActive ? 'bg-indigo-600' : 'bg-zinc-300'
                  }`} />
                )}
              </button>

              {/* Tooltip */}
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] bg-zinc-800 text-white px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                {cat.label}
                {primaryTool.shortcut && <span className="text-zinc-400 ml-1.5">{primaryTool.shortcut}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
