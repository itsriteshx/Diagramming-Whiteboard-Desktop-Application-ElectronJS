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
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { ARCHITECTURE_TEMPLATES } from '../../constants/templates';

const CATEGORIES = [
  'All Templates',
  'Cloud & DevOps',
  'Flowcharts',
  'Mindmaps',
];

export function TemplatesModal({ isOpen, onClose, onLoadTemplate }) {
  const [selectedCategory, setSelectedCategory] = useState('All Templates');
  const [hoveredTemplateId, setHoveredTemplateId] = useState(null);

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
      case 'Cloud':
        return <Cloud size={20} className="text-sky-500" />;
      case 'GitFork':
        return <GitFork size={20} className="text-amber-500" />;
      case 'Network':
        return <Network size={20} className="text-indigo-500" />;
      case 'Boxes':
        return <Boxes size={20} className="text-emerald-500" />;
      default:
        return <LayoutTemplate size={20} className="text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-4xl bg-white border border-zinc-200/90 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-zinc-900">
                  Architecture & Diagram Templates
                </h2>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-100/70 text-indigo-700">
                  {ARCHITECTURE_TEMPLATES.length} Library Presets
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Bootstrap with high-fidelity cloud architectures, decision flowcharts, and mindmaps.
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

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-zinc-100 bg-white">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50/40">
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              onMouseEnter={() => setHoveredTemplateId(tpl.id)}
              onMouseLeave={() => setHoveredTemplateId(null)}
              className="group flex flex-col justify-between bg-white border border-zinc-200/80 hover:border-indigo-400 rounded-xl p-4.5 transition-all shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-zinc-50 border border-zinc-200/60 flex items-center justify-center">
                      {getTemplateIcon(tpl.icon)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                        {tpl.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-zinc-500 font-medium">
                          {tpl.category}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-zinc-300" />
                        <span className="text-[11px] text-zinc-400">
                          {tpl.nodeCount} elements
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600">
                    {tpl.badge}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2 mb-3">
                  {tpl.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tpl.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100/80 text-zinc-600 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Includes live markdown doc</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onLoadTemplate(tpl, 'append')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-medium transition-colors cursor-pointer"
                    title="Insert template nodes alongside existing shapes"
                  >
                    <Plus size={13} />
                    <span>Insert</span>
                  </button>
                  <button
                    onClick={() => onLoadTemplate(tpl, 'replace')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
                    title="Clear current canvas and load this complete template"
                  >
                    <RotateCcw size={12} />
                    <span>Replace Canvas</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Bottom Tip Bar */}
        <div className="px-6 py-2.5 bg-zinc-100/70 border-t border-zinc-200/80 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-zinc-400" />
            <span>
              <strong>Replace Canvas</strong> sets clean layout and synchronizes technical specifications into the Docs Panel.
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
