import { useState, useRef, useEffect } from 'react';
import {
  Menu,
  BookOpen,
  Download,
  FolderOpen,
  Save,
  Trash2,
  Palette,
  Check,
  Copy,
  LayoutTemplate,
  FilePlus,
  FileDown,
  Clock,
  ExternalLink,
  Search,
  Command,
  HelpCircle,
  X,
  ChevronRight,
  Zap,
  PanelLeft,
} from 'lucide-react';
import { CANVAS_BACKGROUNDS } from '../../constants/tools';

export function Header({
  docName,
  setDocName,
  isDirty = false,
  currentFilePath = null,
  onNew,
  onSave,
  onSaveAs,
  onOpen,
  onOpenRecent,
  recentFiles = [],
  onClearRecent,
  onExport,
  onCopyImage,
  onClear,
  onOpenTemplates,
  onOpenCommandPalette,
  onOpenShortcuts,
  isDocsOpen,
  setIsDocsOpen,
  canvasBg,
  setCanvasBg,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleRevealInFolder = () => {
    if (currentFilePath && window.electronAPI?.showInFolder) {
      window.electronAPI.showInFolder(currentFilePath);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="relative z-30 h-12 px-3 flex items-center justify-between bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800 border-b border-zinc-700/50 select-none">
      {/* Left: Brand + Menu + Doc Name */}
      <div className="flex items-center gap-2">
        {/* Brand Mark */}
        <div className="flex items-center gap-2 mr-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-[13px] font-bold text-white tracking-tight hidden sm:block">
            EraserBoard
          </span>
        </div>

        <div className="w-px h-5 bg-zinc-700/60 mx-1" />

        {/* Menu Button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`h-7 px-2 flex items-center gap-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isMenuOpen
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Menu size={14} />
            <span>File</span>
          </button>

          {isMenuOpen && (
            <div className="absolute top-9 left-0 w-72 bg-zinc-900 border border-zinc-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.5)] rounded-xl p-1.5 flex flex-col gap-0.5 text-xs text-zinc-300 z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-xl">
              {/* Canvas Background */}
              <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Palette size={11} />
                <span>Canvas Theme</span>
              </div>

              <div className="grid grid-cols-2 gap-1 px-1 mb-1">
                {CANVAS_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      setCanvasBg(bg);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-all cursor-pointer ${
                      canvasBg?.id === bg.id
                        ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/40'
                        : 'hover:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full border border-zinc-600"
                        style={{ backgroundColor: bg.color }}
                      />
                      <span className="text-[11px]">{bg.label}</span>
                    </div>
                    {canvasBg?.id === bg.id && <Check size={11} />}
                  </button>
                ))}
              </div>

              <div className="w-full h-px bg-zinc-800 my-0.5" />

              {/* Templates */}
              <button
                onClick={() => {
                  onOpenTemplates?.();
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-indigo-500/15 text-indigo-400 font-medium transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <LayoutTemplate size={14} />
                  <span>Architecture Templates</span>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-md">
                  Presets
                </span>
              </button>

              {/* Command Palette */}
              <button
                onClick={() => {
                  onOpenCommandPalette?.();
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Command size={14} />
                  <span>Command Palette</span>
                </div>
                <kbd className="text-[10px] text-zinc-500 font-mono">⌘K</kbd>
              </button>

              {/* Shortcuts */}
              <button
                onClick={() => {
                  onOpenShortcuts?.();
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle size={14} />
                  <span>Keyboard Shortcuts</span>
                </div>
                <kbd className="text-[10px] text-zinc-500 font-mono">?</kbd>
              </button>

              <div className="w-full h-px bg-zinc-800 my-0.5" />

              {/* File Operations */}
              <button
                onClick={() => { onNew?.(); setIsMenuOpen(false); }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FilePlus size={14} />
                  <span>New Whiteboard</span>
                </div>
                <kbd className="text-[10px] text-zinc-500 font-mono">⌘N</kbd>
              </button>

              <button
                onClick={() => { onOpen?.(); setIsMenuOpen(false); }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FolderOpen size={14} />
                  <span>Open Project</span>
                </div>
                <kbd className="text-[10px] text-zinc-500 font-mono">⌘O</kbd>
              </button>

              <button
                onClick={() => { onSave?.(); setIsMenuOpen(false); }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Save size={14} />
                  <span>Save</span>
                </div>
                <kbd className="text-[10px] text-zinc-500 font-mono">⌘S</kbd>
              </button>

              <button
                onClick={() => { onSaveAs?.(); setIsMenuOpen(false); }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileDown size={14} />
                  <span>Save As...</span>
                </div>
                <kbd className="text-[10px] text-zinc-500 font-mono">⇧⌘S</kbd>
              </button>

              <button
                onClick={() => { onExport?.(); setIsMenuOpen(false); }}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Download size={14} />
                  <span>Export Diagram & Docs</span>
                </div>
                <kbd className="text-[10px] text-zinc-500 font-mono">⇧⌘E</kbd>
              </button>

              {currentFilePath && (
                <button
                  onClick={handleRevealInFolder}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors cursor-pointer"
                  title={currentFilePath}
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink size={14} />
                    <span>Reveal in Finder</span>
                  </div>
                </button>
              )}

              {/* Recent Files */}
              {recentFiles && recentFiles.length > 0 && (
                <>
                  <div className="w-full h-px bg-zinc-800 my-0.5" />
                  <div className="px-2.5 py-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock size={10} />
                      <span>Recent Projects</span>
                    </div>
                    {onClearRecent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearRecent();
                        }}
                        className="text-[10px] text-zinc-600 hover:text-zinc-300 cursor-pointer"
                      >
                        clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 max-h-32 overflow-y-auto">
                    {recentFiles.map((rf) => (
                      <button
                        key={rf.path}
                        onClick={() => {
                          onOpenRecent?.(rf.path);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 text-left transition-colors cursor-pointer"
                        title={rf.path}
                      >
                        <span className="truncate max-w-[180px] font-medium text-[11px]">
                          {rf.name}
                        </span>
                        <span className="text-[9px] text-zinc-600 font-mono">
                          {new Date(rf.lastOpened).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="w-full h-px bg-zinc-800 my-0.5" />

              <button
                onClick={() => { onClear?.(); setIsMenuOpen(false); }}
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-red-500/15 text-red-400 transition-colors cursor-pointer"
              >
                <Trash2 size={14} />
                <span>Clear Canvas</span>
              </button>
            </div>
          )}
        </div>

        {/* Document Title & Dirty State */}
        <div className="flex items-center gap-2 min-w-0">
          <input
            type="text"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            className="h-8 text-xs font-semibold text-zinc-200 bg-transparent hover:bg-zinc-800 focus:bg-zinc-800 border border-transparent focus:border-zinc-600 px-2.5 rounded-lg outline-none transition-all w-52 truncate placeholder:text-zinc-600"
            title={currentFilePath ? `Location: ${currentFilePath}` : 'Click to rename diagram'}
          />

          {isDirty ? (
            <div
              className="h-6 flex items-center gap-1.5 px-2 rounded-md bg-amber-500/15 text-amber-400 text-[10px] font-medium shrink-0"
              title="Unsaved changes (Cmd+S to save)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Unsaved</span>
            </div>
          ) : currentFilePath ? (
            <div
              className="h-6 flex items-center gap-1.5 px-2 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-medium shrink-0"
              title={`Saved to ${currentFilePath}`}
            >
              <Check size={11} />
              <span>Saved</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Center: Spotlight Search */}
      <button
        onClick={onOpenCommandPalette}
        className="hidden lg:flex items-center gap-2 h-8 px-3 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/60 hover:border-zinc-600 text-xs text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer shrink-0"
        title="Search commands, tools & templates (Cmd+K)"
      >
        <Search size={13} className="text-zinc-500" />
        <span className="font-normal text-[11px]">Search actions & tools...</span>
        <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-400 leading-none">
          ⌘K
        </kbd>
      </button>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 pr-1">
        <button
          onClick={onOpenTemplates}
          className="h-8 flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all cursor-pointer"
          title="Architecture Templates"
        >
          <LayoutTemplate size={14} className="text-indigo-400" />
          <span>Templates</span>
        </button>

        <button
          onClick={onOpenShortcuts}
          className="h-8 w-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-all cursor-pointer"
          title="Keyboard Shortcuts (? or ⌘/)"
        >
          <HelpCircle size={15} />
        </button>

        <button
          onClick={onCopyImage}
          className="h-8 flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border border-zinc-700/50"
          title="Copy Diagram to Clipboard as Image"
        >
          <Copy size={13} />
          <span>Copy</span>
        </button>

        <button
          onClick={() => setIsDocsOpen(!isDocsOpen)}
          className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            isDocsOpen
              ? 'bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
          }`}
          title="Toggle Architecture Notes"
        >
          <PanelLeft size={14} />
          <span>Docs</span>
        </button>

        <button
          onClick={onExport}
          className="h-8 flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 rounded-lg text-xs font-semibold shadow-md shadow-indigo-500/20 transition-colors cursor-pointer shrink-0"
          title="Export Diagram & Docs (PNG, SVG, MD, JSON)"
        >
          <Download size={13} />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}
