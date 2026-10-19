import { useState } from 'react';
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
  isDocsOpen,
  setIsDocsOpen,
  canvasBg,
  setCanvasBg,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRecentSubmenu, setShowRecentSubmenu] = useState(false);

  const handleRevealInFolder = () => {
    if (currentFilePath && window.electronAPI?.showInFolder) {
      window.electronAPI.showInFolder(currentFilePath);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="relative z-30 h-12 px-4 flex items-center justify-between bg-white border-b border-zinc-200 select-none">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Menu & Settings"
          >
            <Menu size={19} />
          </button>

          {isMenuOpen && (
            <div className="absolute top-12 left-0 w-72 bg-white shadow-2xl border border-zinc-200 rounded-2xl p-2.5 flex flex-col gap-1 text-xs text-zinc-700 animate-in fade-in zoom-in-95 duration-100 z-50">
              {/* Canvas Background Selector */}
              <div className="px-2 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Palette size={13} />
                <span>Canvas Background</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 p-1 mb-1">
                {CANVAS_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      setCanvasBg(bg);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                      canvasBg?.id === bg.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-medium'
                        : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-zinc-300"
                        style={{ backgroundColor: bg.color }}
                      />
                      <span>{bg.label}</span>
                    </div>
                    {canvasBg?.id === bg.id && <Check size={13} />}
                  </button>
                ))}
              </div>

              <div className="w-full h-px bg-zinc-100 my-0.5" />

              {/* Templates */}
              <button
                onClick={() => {
                  onOpenTemplates?.();
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-indigo-50 text-indigo-700 font-medium transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutTemplate size={15} />
                  <span>Architecture Templates...</span>
                </div>
                <span className="text-[10px] bg-indigo-100/70 text-indigo-700 px-1.5 py-0.5 rounded-md">
                  Presets
                </span>
              </button>

              <div className="w-full h-px bg-zinc-100 my-0.5" />

              {/* Native File Actions */}
              <button
                onClick={() => {
                  onNew?.();
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FilePlus size={15} />
                  <span>New Whiteboard</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">⌘N</span>
              </button>

              <button
                onClick={() => {
                  onOpen?.();
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FolderOpen size={15} />
                  <span>Open Project...</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">⌘O</span>
              </button>

              <button
                onClick={() => {
                  onSave?.();
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Save size={15} />
                  <span>Save Project</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">⌘S</span>
              </button>

              <button
                onClick={() => {
                  onSaveAs?.();
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileDown size={15} />
                  <span>Save Project As...</span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">⇧⌘S</span>
              </button>

              {currentFilePath && (
                <button
                  onClick={handleRevealInFolder}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-600 transition-colors cursor-pointer"
                  title={currentFilePath}
                >
                  <div className="flex items-center gap-2.5">
                    <ExternalLink size={15} />
                    <span>Reveal in Finder</span>
                  </div>
                </button>
              )}

              {/* Recent Files Submenu */}
              {recentFiles && recentFiles.length > 0 && (
                <>
                  <div className="w-full h-px bg-zinc-100 my-0.5" />
                  <div className="px-2 py-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} />
                      <span>Recent Projects</span>
                    </div>
                    {onClearRecent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearRecent();
                        }}
                        className="text-[10px] text-zinc-400 hover:text-zinc-700 cursor-pointer lowercase"
                      >
                        clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 max-h-36 overflow-y-auto">
                    {recentFiles.map((rf) => (
                      <button
                        key={rf.path}
                        onClick={() => {
                          onOpenRecent?.(rf.path);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 text-zinc-700 text-left transition-colors cursor-pointer"
                        title={rf.path}
                      >
                        <span className="truncate max-w-[190px] font-medium text-xs">
                          {rf.name}
                        </span>
                        <span className="text-[9px] text-zinc-400 font-mono">
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

              <div className="w-full h-px bg-zinc-100 my-0.5" />

              <button
                onClick={() => {
                  onClear?.();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors cursor-pointer"
              >
                <Trash2 size={15} />
                <span>Clear Canvas</span>
              </button>
            </div>
          )}
        </div>

        {/* Document Title & Dirty State Badge */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            className="text-sm font-semibold text-zinc-800 bg-transparent hover:bg-zinc-100/80 focus:bg-white border border-transparent focus:border-zinc-300 px-2 py-1 rounded-lg outline-none transition-all w-56 truncate"
            title={currentFilePath ? `Location: ${currentFilePath}` : 'Click to rename diagram'}
          />

          {isDirty ? (
            <div
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-medium"
              title="Unsaved changes (Cmd+S to save)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Unsaved</span>
            </div>
          ) : currentFilePath ? (
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10px] font-medium"
              title={`Saved to ${currentFilePath}`}
            >
              <Check size={11} className="text-emerald-600" />
              <span>Saved</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Right Actions Toolbar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-700 hover:text-indigo-600 hover:bg-indigo-50/80 border border-zinc-200/80 transition-all cursor-pointer shadow-2xs"
          title="Choose Ready-made Architecture Templates"
        >
          <LayoutTemplate size={14} className="text-indigo-500" />
          <span>Templates</span>
        </button>

        <button
          onClick={onCopyImage}
          className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          title="Copy Diagram to Clipboard as Image"
        >
          <Copy size={14} />
          <span>Copy Image</span>
        </button>

        <button
          onClick={() => setIsDocsOpen(!isDocsOpen)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            isDocsOpen
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              : 'text-zinc-600 hover:bg-zinc-100 border border-transparent'
          }`}
          title="Toggle Architecture Notes"
        >
          <BookOpen size={15} />
          <span>Docs</span>
        </button>

        <button
          onClick={onExport}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          title="Export Diagram as PNG"
        >
          <Download size={14} />
          <span>Export PNG</span>
        </button>
      </div>
    </header>
  );
}
