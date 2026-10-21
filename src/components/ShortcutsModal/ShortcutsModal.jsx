import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Keyboard,
  Sparkles,
  Command,
  HelpCircle,
} from 'lucide-react';
import { SHORTCUT_CATEGORIES, SHORTCUTS } from '../../constants/shortcuts';

export function ShortcutsModal({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef(null);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setActiveCategory('all');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter shortcuts
  const filteredShortcuts = useMemo(() => {
    return SHORTCUTS.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.keys.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [activeCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-zinc-200/90 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Keyboard size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                <span>Keyboard Shortcuts & Quick Actions</span>
              </h2>
              <p className="text-xs text-zinc-500">
                Speed up diagramming, navigation, and canvas manipulation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="px-6 py-3 border-b border-zinc-100 bg-white flex flex-col gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcut name, action, or key..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-zinc-50/80 hover:bg-zinc-100/60 focus:bg-white rounded-xl border border-zinc-200/80 focus:border-indigo-500 focus:outline-none focus:ring-3 focus:ring-indigo-500/10 transition-all text-zinc-800 placeholder:text-zinc-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {SHORTCUT_CATEGORIES.map((cat) => {
              const count =
                cat.id === 'all'
                  ? SHORTCUTS.length
                  : SHORTCUTS.filter((s) => s.category === cat.id).length;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-2xs'
                      : 'bg-zinc-100/70 hover:bg-zinc-200/70 text-zinc-600'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? 'bg-zinc-700 text-zinc-200'
                        : 'bg-zinc-200/80 text-zinc-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shortcuts List Content */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[55vh]">
          {filteredShortcuts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
                <HelpCircle size={22} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-700 mb-1">
                No shortcuts found
              </h3>
              <p className="text-xs text-zinc-400 max-w-xs">
                No shortcut matches "{searchQuery}". Try searching by key like "cmd", "alt", or action name.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredShortcuts.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 hover:border-zinc-200 bg-zinc-50/40 hover:bg-zinc-50 transition-colors group"
                >
                  <div className="pr-3 min-w-0">
                    <h4 className="text-xs font-semibold text-zinc-800 group-hover:text-indigo-600 transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>

                  {/* Keycap Badges */}
                  <div className="flex items-center gap-1 shrink-0">
                    {item.keys.map((k, idx) => (
                      <kbd
                        key={idx}
                        className="inline-flex items-center justify-center min-w-[22px] h-6 px-1.5 text-[11px] font-mono font-semibold text-zinc-700 bg-white border border-zinc-300/80 rounded-md shadow-[0_1.5px_0_0_rgba(0,0,0,0.08)] select-none"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-100 bg-zinc-50/70 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span>Showing <strong>{filteredShortcuts.length}</strong> shortcuts</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-white border border-zinc-200 rounded shadow-2xs text-zinc-600">
              Esc
            </kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
