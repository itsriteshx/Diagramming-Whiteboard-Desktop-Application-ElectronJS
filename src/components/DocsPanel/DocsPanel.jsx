import { useState, useRef, useCallback } from 'react';
import {
  BookOpen,
  X,
  Edit3,
  Eye,
  Columns2,
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  List,
  ListTodo,
  Quote,
  Table,
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

export function DocsPanel({ docsContent, setDocsContent, docName = 'Architecture Spec', onClose }) {
  const [mode, setMode] = useState('split'); // 'edit' | 'split' | 'preview'
  const [width, setWidth] = useState(480);
  const [isCopied, setIsCopied] = useState(false);
  const isResizing = useRef(false);
  const textareaRef = useRef(null);

  // Resize handler
  const handleMouseDownResize = (e) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const onMouseMove = (moveEvent) => {
      if (!isResizing.current) return;
      const newWidth = Math.max(340, Math.min(880, moveEvent.clientX));
      setWidth(newWidth);
    };

    const onMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // Toggle tasks in markdown
  const handleToggleTask = useCallback(
    (lineIndex) => {
      const lines = docsContent.split('\n');
      if (lineIndex < 0 || lineIndex >= lines.length) return;

      const targetLine = lines[lineIndex];
      let updatedLine = targetLine;

      if (targetLine.includes('- [ ]')) {
        updatedLine = targetLine.replace('- [ ]', '- [x]');
      } else if (targetLine.includes('- [x]')) {
        updatedLine = targetLine.replace('- [x]', '- [ ]');
      } else if (targetLine.includes('- [X]')) {
        updatedLine = targetLine.replace('- [X]', '- [ ]');
      }

      lines[lineIndex] = updatedLine;
      setDocsContent(lines.join('\n'));
    },
    [docsContent, setDocsContent]
  );

  // Markdown formatting toolbar helper
  const insertFormatting = (prefix, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = docsContent.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent =
      docsContent.substring(0, start) + replacement + docsContent.substring(end);
    setDocsContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 10);
  };

  // Copy full document
  const handleCopyDoc = () => {
    navigator.clipboard.writeText(docsContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1800);
  };

  // Download .md file
  const handleDownloadDoc = () => {
    const filename = `${docName.toLowerCase().replace(/\s+/g, '-')}-spec.md`;
    const blob = new Blob([docsContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Metrics
  const lineCount = docsContent.split('\n').length;
  const wordCount = docsContent.trim() ? docsContent.trim().split(/\s+/).length : 0;
  const charCount = docsContent.length;

  return (
    <aside
      style={{ width }}
      className="relative h-full bg-white/95 border-r border-zinc-200/90 flex flex-col z-20 shadow-xl backdrop-blur-md select-none transition-all duration-75"
    >
      {/* Top Header */}
      <div className="px-3.5 py-2.5 border-b border-zinc-200/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen size={16} className="text-indigo-600 flex-shrink-0" />
          <span className="text-xs font-semibold text-zinc-800 truncate">
            {docName}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* View mode toggle */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/60">
            <button
              onClick={() => setMode('edit')}
              title="Edit Markdown"
              className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                mode === 'edit'
                  ? 'bg-white shadow-xs text-indigo-600 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Edit3 size={12} />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setMode('split')}
              title="Split View"
              className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                mode === 'split'
                  ? 'bg-white shadow-xs text-indigo-600 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Columns2 size={12} />
              <span>Split</span>
            </button>
            <button
              onClick={() => setMode('preview')}
              title="Preview Rendered"
              className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                mode === 'preview'
                  ? 'bg-white shadow-xs text-indigo-600 font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Eye size={12} />
              <span>Preview</span>
            </button>
          </div>

          <div className="w-px h-4 bg-zinc-200 mx-0.5" />

          {/* Width toggle */}
          <button
            onClick={() => setWidth((prev) => (prev > 500 ? 380 : 640))}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            title={width > 500 ? 'Collapse width' : 'Expand width'}
          >
            {width > 500 ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          {/* Copy document */}
          <button
            onClick={handleCopyDoc}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Copy Markdown"
          >
            {isCopied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          </button>

          {/* Download document */}
          <button
            onClick={handleDownloadDoc}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Download .md file"
          >
            <Download size={13} />
          </button>

          {/* Close Docs */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Close Docs"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Formatting Toolbar (shown when editor is active) */}
      {(mode === 'edit' || mode === 'split') && (
        <div className="px-3 py-1.5 bg-zinc-50/80 border-b border-zinc-200/70 flex items-center gap-1 flex-wrap text-zinc-600">
          <button
            onClick={() => insertFormatting('# ', '', 'Heading 1')}
            className="p-1 rounded-md hover:bg-white hover:text-indigo-600 hover:shadow-2xs transition-all cursor-pointer"
            title="Heading 1"
          >
            <Heading1 size={13} />
          </button>
          <button
            onClick={() => insertFormatting('## ', '', 'Heading 2')}
            className="p-1 rounded-md hover:bg-white hover:text-indigo-600 hover:shadow-2xs transition-all cursor-pointer"
            title="Heading 2"
          >
            <Heading2 size={13} />
          </button>
          <div className="w-px h-3.5 bg-zinc-200 mx-0.5" />
          <button
            onClick={() => insertFormatting('**', '**', 'bold text')}
            className="p-1 rounded-md hover:bg-white hover:text-indigo-600 hover:shadow-2xs transition-all cursor-pointer"
            title="Bold"
          >
            <Bold size={13} />
          </button>
          <button
            onClick={() => insertFormatting('*', '*', 'italic text')}
            className="p-1 rounded-md hover:bg-white hover:text-indigo-600 hover:shadow-2xs transition-all cursor-pointer"
            title="Italic"
          >
            <Italic size={13} />
          </button>
          <button
            onClick={() => insertFormatting('`', '`', 'code')}
            className="p-1 rounded-md hover:bg-white hover:text-indigo-600 hover:shadow-2xs transition-all cursor-pointer"
            title="Inline Code"
          >
            <Code size={13} />
          </button>
          <div className="w-px h-3.5 bg-zinc-200 mx-0.5" />
          <button
            onClick={() => insertFormatting('> ', '', 'Quote text')}
            className="p-1 rounded-md hover:bg-white hover:text-indigo-600 hover:shadow-2xs transition-all cursor-pointer"
            title="Quote"
          >
            <Quote size={13} />
          </button>
          <button
            onClick={() => insertFormatting('- ', '', 'List item')}
            className="p-1 rounded-md hover:bg-white hover:text-indigo-600 hover:shadow-2xs transition-all cursor-pointer"
            title="Bullet List"
          >
            <List size={13} />
          </button>
          <button
            onClick={() => insertFormatting('- [ ] ', '', 'Task item')}
            className="p-1 rounded-md hover:bg-white hover:text-indigo-600 hover:shadow-2xs transition-all cursor-pointer"
            title="Task List"
          >
            <ListTodo size={13} />
          </button>
          <button
            onClick={() =>
              insertFormatting(
                '\n| Feature | Status | Details |\n| :--- | :--- | :--- |\n| Core Architecture | Done | v1.0 |\n',
                ''
              )
            }
            className="p-1 rounded-md hover:bg-white hover:text-indigo-600 hover:shadow-2xs transition-all cursor-pointer"
            title="Insert Table"
          >
            <Table size={13} />
          </button>
          <button
            onClick={() => insertFormatting('\n```javascript\n', '\n```\n', '// write code here')}
            className="px-1.5 py-0.5 text-[10px] font-mono rounded-md hover:bg-white hover:text-indigo-600 hover:shadow-2xs transition-all cursor-pointer"
            title="Code Block"
          >
            {'{ }'}
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Editor Area */}
        {(mode === 'edit' || mode === 'split') && (
          <div
            className={`flex-1 h-full flex flex-col min-w-0 ${
              mode === 'split' ? 'border-r border-zinc-200/80' : ''
            }`}
          >
            <textarea
              ref={textareaRef}
              value={docsContent}
              onChange={(e) => setDocsContent(e.target.value)}
              className="flex-1 w-full p-4 bg-transparent resize-none outline-none font-mono text-xs leading-relaxed text-zinc-800 select-text placeholder:text-zinc-400 overflow-y-auto scrollbar-thin"
              placeholder={`# Technical Architecture\n\n## Overview\nDocument your system workflow here...\n\n- [ ] Task 1\n- [x] Task 2 (completed)`}
            />
          </div>
        )}

        {/* Live Preview Area */}
        {(mode === 'preview' || mode === 'split') && (
          <div className="flex-1 h-full overflow-y-auto p-4 scrollbar-thin min-w-0 bg-white/70">
            <MarkdownRenderer content={docsContent} onToggleTask={handleToggleTask} />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-3.5 py-2 border-t border-zinc-200/80 text-[11px] text-zinc-500 flex items-center justify-between bg-zinc-50/70 select-none">
        <div className="flex items-center gap-3">
          <span>{lineCount} lines</span>
          <span>·</span>
          <span>{wordCount} words</span>
          <span>·</span>
          <span>{charCount} chars</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Synced with Workspace</span>
        </div>
      </div>

      {/* Drag-to-resize border handle */}
      <div
        onMouseDown={handleMouseDownResize}
        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-indigo-500/30 transition-colors z-30"
        title="Drag to resize panel"
      />
    </aside>
  );
}
