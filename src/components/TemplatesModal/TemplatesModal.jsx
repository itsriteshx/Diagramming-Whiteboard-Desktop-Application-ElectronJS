import { useState, useEffect } from 'react';
import {
  X,
  LayoutTemplate,
  Cloud,
  GitFork,
  Network,
  Boxes,
  Plus,
  RotateCcw,
  Sparkles,
  Layers,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { ARCHITECTURE_TEMPLATES } from '../../constants/templates';

const CATEGORIES = [
  'All Templates',
  'Wireframes',
  'Cloud & DevOps',
  'Flowcharts',
  'Mindmaps',
];

export function TemplatesModal({ isOpen, onClose, onLoadTemplate }) {
  const [selectedCategory, setSelectedCategory] = useState('All Templates');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTemplates = ARCHITECTURE_TEMPLATES.filter((tpl) => {
    if (selectedCategory === 'All Templates') return true;
    return tpl.category === selectedCategory;
  });

  const getTemplateIcon = (iconName) => {
    switch (iconName) {
      case 'Layout':
        return <LayoutTemplate size={18} className="text-purple-600" />;
      case 'Cloud':
        return <Cloud size={18} className="text-sky-600" />;
      case 'GitFork':
        return <GitFork size={18} className="text-amber-600" />;
      case 'Network':
        return <Network size={18} className="text-indigo-600" />;
      case 'Boxes':
        return <Boxes size={18} className="text-emerald-600" />;
      default:
        return <LayoutTemplate size={18} className="text-indigo-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-4xl bg-white border border-zinc-200/90 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200/80 bg-zinc-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-zinc-900 tracking-tight">
                  Architecture & Diagram Templates
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100/70 text-indigo-700">
                  {ARCHITECTURE_TEMPLATES.length} Presets
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Pre-configured architecture diagrams with synchronized markdown specifications.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Tabs Bar */}
        <div className="px-6 py-3 border-b border-zinc-200/70 bg-zinc-50/50 flex items-center justify-between gap-4">
          <div className="inline-flex items-center gap-1 bg-zinc-200/70 p-1 rounded-xl">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-7 px-3.5 flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-zinc-900 shadow-xs ring-1 ring-zinc-300/60'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-zinc-400 font-medium">
            Showing {filteredTemplates.length} of {ARCHITECTURE_TEMPLATES.length}
          </span>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50/30">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="group flex flex-col justify-between bg-white border border-zinc-200/90 hover:border-indigo-400/90 rounded-2xl p-5 transition-all shadow-xs hover:shadow-md"
            >
              <div>
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-zinc-100/80 border border-zinc-200 flex items-center justify-center shrink-0 mt-0.5">
                      {getTemplateIcon(tpl.icon)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors truncate">
                        {tpl.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-zinc-500 flex-wrap">
                        <span className="font-semibold text-zinc-600">{tpl.category}</span>
                        <span>•</span>
                        <span>{tpl.nodeCount} elements</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                          <span>Docs Included</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 shrink-0 border border-zinc-200/60">
                    {tpl.badge}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2 mb-3 min-h-[36px]">
                  {tpl.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tpl.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 font-mono border border-zinc-200/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3.5 border-t border-zinc-100 flex items-center justify-between gap-2 mt-auto">
                <div className="text-[11px] text-zinc-400 font-mono">
                  {tpl.shapes?.length || tpl.nodeCount} objects
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onLoadTemplate(tpl, 'append')}
                    className="h-8 px-3 flex items-center gap-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-100 hover:border-zinc-300 text-zinc-700 text-xs font-semibold transition-colors cursor-pointer"
                    title="Insert template nodes alongside existing shapes"
                  >
                    <Plus size={14} />
                    <span>Insert</span>
                  </button>
                  <button
                    onClick={() => onLoadTemplate(tpl, 'replace')}
                    className="h-8 px-3.5 flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
                    title="Clear current canvas and load this complete template"
                  >
                    <RotateCcw size={13} />
                    <span>Replace Canvas</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Bottom Tip Bar */}
        <div className="px-6 py-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2 min-w-0 pr-4">
            <Layers size={14} className="text-indigo-600 shrink-0" />
            <span className="truncate">
              <strong className="text-zinc-700">Replace Canvas</strong> synchronizes the technical specifications directly into the Docs Panel.
            </span>
          </div>
          <button
            onClick={onClose}
            className="h-8 px-4 flex items-center justify-center rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
