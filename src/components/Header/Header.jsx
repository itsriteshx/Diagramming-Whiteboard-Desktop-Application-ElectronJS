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
} from 'lucide-react';
import { CANVAS_BACKGROUNDS } from '../../constants/tools';

export function Header({
  docName,
  setDocName,
  onSave,
  onOpen,
  onExport,
  onCopyImage,
  onClear,
  isDocsOpen,
  setIsDocsOpen,
  canvasBg,
  setCanvasBg,
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <div className="absolute top-12 left-0 w-64 bg-white shadow-2xl border border-zinc-200 rounded-2xl p-2.5 flex flex-col gap-1 text-xs text-zinc-700 animate-in fade-in zoom-in-95 duration-100 z-50">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Palette size={13} />
                <span>Canvas Background</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 p-1 mb-2">
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

              <button
                onClick={() => {
                  onOpen();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
              >
                <FolderOpen size={15} />
                <span>Open Project File...</span>
              </button>

              <button
                onClick={() => {
                  onSave();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-100 text-zinc-700 transition-colors cursor-pointer"
              >
                <Save size={15} />
                <span>Save to Disk (.eraser)</span>
              </button>

              <button
                onClick={() => {
                  onClear();
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

        <input
          type="text"
          value={docName}
          onChange={(e) => setDocName(e.target.value)}
          className="text-sm font-semibold text-zinc-800 bg-transparent hover:bg-zinc-100/80 focus:bg-white border border-transparent focus:border-zinc-300 px-2 py-1 rounded-lg outline-none transition-all w-56 truncate"
          title="Click to rename diagram"
        />
      </div>

      <div className="flex items-center gap-2">
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
