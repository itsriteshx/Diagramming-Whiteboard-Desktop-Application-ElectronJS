import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Command,
  Square,
  Diamond,
  Circle,
  ArrowRight,
  Minus,
  PenTool,
  Type,
  Eraser,
  Database,
  Cloud,
  Triangle,
  Hexagon,
  FilePlus,
  Save,
  FolderOpen,
  Download,
  Trash2,
  BookOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Palette,
  Sparkles,
  HelpCircle,
  MousePointer,
  Hand,
  Users,
} from 'lucide-react';
import { TOOLS, CANVAS_BACKGROUNDS } from '../../constants/tools';
import { ARCHITECTURE_TEMPLATES } from '../../constants/templates';

export function CommandPalette({
  isOpen,
  onClose,
  setActiveTool,
  onNew,
  onSave,
  onSaveAs,
  onOpen,
  onExport,
  onClear,
  onOpenTemplates,
  onLoadTemplate,
  isDocsOpen,
  setIsDocsOpen,
  canvasBg,
  setCanvasBg,
  zoomIn,
  zoomOut,
  resetView,
  onOpenShortcuts,
  onOpenCollab,
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const allCommands = useMemo(() => {
    const list = [
      // Tools
      { id: 'tool-select', title: 'Select & Move', category: 'Drawing Tools', shortcut: 'V', icon: <MousePointer size={15} />, action: () => setActiveTool(TOOLS.SELECT) },
      { id: 'tool-pan', title: 'Hand / Pan Canvas', category: 'Drawing Tools', shortcut: 'H', icon: <Hand size={15} />, action: () => setActiveTool(TOOLS.PAN) },
      { id: 'tool-rect', title: 'Rectangle Node', category: 'Drawing Tools', shortcut: 'R', icon: <Square size={15} />, action: () => setActiveTool(TOOLS.RECTANGLE) },
      { id: 'tool-diamond', title: 'Decision Diamond', category: 'Drawing Tools', shortcut: 'D', icon: <Diamond size={15} />, action: () => setActiveTool(TOOLS.DIAMOND) },
      { id: 'tool-ellipse', title: 'Ellipse / Circle', category: 'Drawing Tools', shortcut: 'O', icon: <Circle size={15} />, action: () => setActiveTool(TOOLS.ELLIPSE) },
      { id: 'tool-arrow', title: 'Flowchart Connector Arrow', category: 'Drawing Tools', shortcut: 'A', icon: <ArrowRight size={15} />, action: () => setActiveTool(TOOLS.ARROW) },
      { id: 'tool-line', title: 'Straight Line', category: 'Drawing Tools', shortcut: 'L', icon: <Minus size={15} />, action: () => setActiveTool(TOOLS.LINE) },
      { id: 'tool-pen', title: 'Freehand Pen', category: 'Drawing Tools', shortcut: 'P', icon: <PenTool size={15} />, action: () => setActiveTool(TOOLS.PEN) },
      { id: 'tool-text', title: 'Text Element', category: 'Drawing Tools', shortcut: 'T', icon: <Type size={15} />, action: () => setActiveTool(TOOLS.TEXT) },
      { id: 'tool-db', title: 'Database Cylinder', category: 'Drawing Tools', shortcut: 'B', icon: <Database size={15} />, action: () => setActiveTool(TOOLS.DATABASE) },
      { id: 'tool-cloud', title: 'Cloud Infrastructure Node', category: 'Drawing Tools', shortcut: 'C', icon: <Cloud size={15} />, action: () => setActiveTool(TOOLS.CLOUD) },
      { id: 'tool-triangle', title: 'Triangle', category: 'Drawing Tools', shortcut: 'G', icon: <Triangle size={15} />, action: () => setActiveTool(TOOLS.TRIANGLE) },
      { id: 'tool-hexagon', title: 'Hexagon', category: 'Drawing Tools', shortcut: 'X', icon: <Hexagon size={15} />, action: () => setActiveTool(TOOLS.HEXAGON) },
      { id: 'tool-eraser', title: 'Eraser Tool', category: 'Drawing Tools', shortcut: 'E', icon: <Eraser size={15} />, action: () => setActiveTool(TOOLS.ERASER) },

      // Templates
      ...ARCHITECTURE_TEMPLATES.map((tpl) => ({
        id: `tpl-${tpl.id}`,
        title: `Load ${tpl.title}`,
        category: 'Architecture Templates',
        shortcut: 'Template',
        icon: <Sparkles size={15} className="text-indigo-500" />,
        action: () => onLoadTemplate?.(tpl, 'replace'),
      })),

      // File
      { id: 'file-new', title: 'New Whiteboard', category: 'File Operations', shortcut: '⌘N', icon: <FilePlus size={15} />, action: onNew },
      { id: 'file-open', title: 'Open Project File...', category: 'File Operations', shortcut: '⌘O', icon: <FolderOpen size={15} />, action: onOpen },
      { id: 'file-save', title: 'Save Project', category: 'File Operations', shortcut: '⌘S', icon: <Save size={15} />, action: onSave },
      { id: 'file-save-as', title: 'Save Project As...', category: 'File Operations', shortcut: '⇧⌘S', icon: <Save size={15} />, action: onSaveAs },
      { id: 'file-export', title: 'Export Diagram & Docs (PNG, SVG, MD)', category: 'File Operations', shortcut: '⇧⌘E', icon: <Download size={15} />, action: onExport },
      { id: 'file-clear', title: 'Clear Entire Whiteboard', category: 'File Operations', shortcut: '', icon: <Trash2 size={15} className="text-red-500" />, action: onClear },

      // View & Collaboration
      { id: 'view-collab', title: 'Live Collaboration Session (Share / Join)...', category: 'Collaboration', shortcut: 'Collab', icon: <Users size={15} className="text-emerald-400" />, action: onOpenCollab },
      { id: 'view-docs', title: isDocsOpen ? 'Close Architecture Docs' : 'Open Architecture Docs', category: 'View & Panels', shortcut: 'Docs', icon: <BookOpen size={15} />, action: () => setIsDocsOpen(!isDocsOpen) },
      { id: 'view-templates', title: 'Open Templates Gallery...', category: 'View & Panels', shortcut: '', icon: <Sparkles size={15} />, action: onOpenTemplates },
      { id: 'view-shortcuts', title: 'Keyboard Shortcuts Cheatsheet', category: 'Help & Shortcuts', shortcut: '?', icon: <HelpCircle size={15} />, action: onOpenShortcuts },
      { id: 'view-zoomin', title: 'Zoom In', category: 'View & Panels', shortcut: '⌘+', icon: <ZoomIn size={15} />, action: zoomIn },
      { id: 'view-zoomout', title: 'Zoom Out', category: 'View & Panels', shortcut: '⌘-', icon: <ZoomOut size={15} />, action: zoomOut },
      { id: 'view-reset', title: 'Reset View (100%)', category: 'View & Panels', shortcut: '⌘0', icon: <RotateCcw size={15} />, action: resetView },

      // Themes
      ...CANVAS_BACKGROUNDS.map((bg) => ({
        id: `theme-${bg.id}`,
        title: `Background: ${bg.label}`,
        category: 'Canvas Background',
        shortcut: '',
        icon: <Palette size={15} />,
        action: () => setCanvasBg(bg),
      })),
    ];
    return list;
  }, [
    setActiveTool,
    onLoadTemplate,
    onNew,
    onOpen,
    onSave,
    onSaveAs,
    onExport,
    onClear,
    isDocsOpen,
    setIsDocsOpen,
    onOpenTemplates,
    onOpenShortcuts,
    onOpenCollab,
    zoomIn,
    zoomOut,
    resetView,
    setCanvasBg,
  ]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return allCommands;
    const q = query.toLowerCase().trim();
    return allCommands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.shortcut.toLowerCase().includes(q)
    );
  }, [allCommands, query]);

  // Adjust selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation inside palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) {
          cmd.action?.();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-xl bg-white border border-zinc-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-100 bg-zinc-50/60">
          <Search size={18} className="text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, tool, or template..."
            className="flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none"
          />
          <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
            <span>ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-80 overflow-y-auto p-2 flex flex-col gap-0.5 divide-y divide-zinc-50"
        >
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  data-selected={isSelected}
                  onClick={() => {
                    cmd.action?.();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-900'
                      : 'text-zinc-700 hover:bg-zinc-100/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {cmd.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-xs">{cmd.title}</div>
                      <div className="text-[10px] text-zinc-400">{cmd.category}</div>
                    </div>
                  </div>

                  {cmd.shortcut && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                        isSelected
                          ? 'bg-white border-indigo-200 text-indigo-700 font-semibold'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-400'
                      }`}
                    >
                      {cmd.shortcut}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center text-xs text-zinc-400 flex flex-col items-center gap-2">
              <Command size={24} className="text-zinc-300" />
              <span>No commands or tools matching &quot;{query}&quot;</span>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="px-4 py-2 border-t border-zinc-100 bg-zinc-50/70 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-zinc-200/80 text-zinc-700 px-1 py-0.5 rounded text-[10px]">↑</kbd>{' '}
              <kbd className="font-mono bg-zinc-200/80 text-zinc-700 px-1 py-0.5 rounded text-[10px]">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="font-mono bg-zinc-200/80 text-zinc-700 px-1 py-0.5 rounded text-[10px]">↵</kbd> to select
            </span>
          </div>
          <span><strong>{filteredCommands.length}</strong> actions</span>
        </div>
      </div>
    </div>
  );
}
