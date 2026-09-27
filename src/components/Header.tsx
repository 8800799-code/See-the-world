import React from 'react';
import { Camera, Compass, BookOpen, Volume2, Sparkles, Search, Scan } from 'lucide-react';

interface HeaderProps {
  onOpenJournal: () => void;
  journalCount: number;
  onReset: () => void;
  hasActiveLandmark: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenJournal,
  journalCount,
  onReset,
  hasActiveLandmark,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-cyan-950/60 px-4 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          onClick={onReset}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-shadow">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden">
              <Compass className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
              <div className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                UrbanLens AR
              </span>
              <span className="text-[10px] font-mono-tech px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-widest">
                v3.8
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              City Landmark Explorer & Historic Narrator
            </p>
          </div>
        </button>

        {/* AI Capabilities Pill Bar */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono-tech">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-cyan-500/20 text-slate-300">
            <Scan className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Vision:</span>
            <span className="text-cyan-300 font-semibold">Gemini 3.1 Pro</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-emerald-500/20 text-slate-300">
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span>Search Grounding:</span>
            <span className="text-emerald-300 font-semibold">Gemini 3.5 Flash</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-purple-500/20 text-slate-300">
            <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Narration TTS:</span>
            <span className="text-purple-300 font-semibold">Gemini 3.8 Flash TTS</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {hasActiveLandmark && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-xs text-slate-300 border border-slate-700/60 transition"
              title="Capture or select a new landmark photo"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">New Scan</span>
            </button>
          )}

          <button
            onClick={onOpenJournal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-800/50 text-xs font-medium transition shadow-sm hover:border-cyan-600/50"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Passport Journal</span>
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-200 text-[11px] font-mono-tech font-bold">
              {journalCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
