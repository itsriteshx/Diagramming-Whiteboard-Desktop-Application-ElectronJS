import { useEffect, useState, useRef } from 'react';
import {
  Pencil,
  Share2,
  Layers,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const FEATURES = [
  { icon: Pencil,  label: 'Draw freely',        desc: 'Shapes, connectors, freehand pen' },
  { icon: Layers,  label: 'Layer anything',      desc: 'Nested elements with z-ordering' },
  { icon: Share2,  label: 'Collaborate live',    desc: 'Real-time multiplayer canvas' },
  { icon: Zap,     label: 'Keyboard-first',      desc: '40+ shortcuts for speed' },
];

export function WelcomeScreen({ onDismiss }) {
  const [phase, setPhase] = useState('enter'); // enter | idle | exit
  const timerRef = useRef(null);

  const handleDismiss = () => {
    clearTimeout(timerRef.current);
    setPhase('exit');
    setTimeout(onDismiss, 500);
  };

  useEffect(() => {
    // After 3.8 s auto-exit
    timerRef.current = setTimeout(() => handleDismiss(), 3800);
    return () => clearTimeout(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center
        bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900
        transition-all duration-500 ease-out cursor-pointer select-none
        ${phase === 'exit' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'}`}
      onClick={handleDismiss}
    >
      {/* Glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-indigo-500/8 blur-[80px]" />
      </div>

      {/* Floating dots grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Main card */}
      <div
        className="relative flex flex-col items-center gap-8 px-12 py-14 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logo badge */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_60px_rgba(99,102,241,0.5)] ring-1 ring-white/10">
              <Pencil size={36} className="text-white drop-shadow-lg" strokeWidth={1.8} />
            </div>
            {/* Sparkle */}
            <Sparkles size={18} className="absolute -top-3 -right-3 text-amber-400 animate-bounce" style={{ animationDuration: '2s' }} />
          </div>

          {/* Brand */}
          <div className="text-center">
            <div className="text-xs font-semibold tracking-[0.25em] uppercase text-indigo-400 mb-2">
              Welcome to
            </div>
            <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-violet-300 leading-none">
              EraserBoard
            </h1>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
              Your infinite canvas for diagrams, architecture maps, and visual thinking.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

        {/* Feature pills */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/8 backdrop-blur-sm hover:bg-white/8 transition-colors"
            >
              <div className="mt-0.5 w-7 h-7 rounded-lg bg-indigo-600/30 flex items-center justify-center flex-shrink-0 ring-1 ring-indigo-500/30">
                <Icon size={14} className="text-indigo-300" strokeWidth={2} />
              </div>
              <div>
                <div className="text-[12px] font-semibold text-white/90">{label}</div>
                <div className="text-[11px] text-slate-500 leading-snug">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleDismiss}
          className="group flex items-center gap-2.5 px-8 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-[0_8px_32px_rgba(99,102,241,0.45)] hover:shadow-[0_8px_40px_rgba(99,102,241,0.65)] transition-all duration-200 active:scale-95 cursor-pointer ring-1 ring-white/10"
        >
          <span>Start Creating</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
        </button>

        {/* Auto-dismiss hint */}
        <p className="text-[11px] text-slate-600 -mt-3">
          Click anywhere or press any key to continue
        </p>
      </div>

      {/* Progress bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 origin-left"
          style={{ animation: 'progressBar 3.8s linear forwards' }}
        />
      </div>

      <style>{`
        @keyframes progressBar {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
