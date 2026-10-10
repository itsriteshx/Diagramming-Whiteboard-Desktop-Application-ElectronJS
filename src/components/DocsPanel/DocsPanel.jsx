// src/components/DocsPanel/DocsPanel.jsx
import { BookOpen, X } from 'lucide-react';

/**
 * 🌟 Eraser.io Split-Screen Technical Documentation Panel
 */
export function DocsPanel({ docsContent, setDocsContent, onClose }) {
  return (
    <aside className="w-80 h-full bg-white/95 border-r border-zinc-200/90 flex flex-col z-10 shadow-lg backdrop-blur-md select-none">
      <div className="px-4 py-3 border-b border-zinc-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
          <BookOpen size={15} className="text-indigo-600" />
          <span>Technical Architecture Notes</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          title="Close Docs"
        >
          <X size={15} />
        </button>
      </div>

      <textarea
        value={docsContent}
        onChange={(e) => setDocsContent(e.target.value)}
        className="flex-1 w-full p-4 bg-transparent resize-none outline-none font-mono text-xs leading-relaxed text-zinc-700 select-text placeholder:text-zinc-400"
        placeholder={`# System Architecture Spec\n\n## Overview\nDocument your workflow and ideas here...\n`}
      />

      <div className="px-4 py-2.5 border-t border-zinc-200/80 text-[11px] text-zinc-400 flex items-center justify-between">
        <span>Markdown Supported</span>
        <span>Autosyncs with Project</span>
      </div>
    </aside>
  );
}
