import React, { useState } from 'react';
import {
  Clock,
  History,
  Key,
  ExternalLink,
  Search,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Compass,
  Lightbulb,
  Building,
  Info,
} from 'lucide-react';
import { GroundingMetadata, LandmarkHistoryData } from '../types.ts';

interface HistoryTimelineDrawerProps {
  historyData: LandmarkHistoryData;
  grounding: GroundingMetadata;
}

export const HistoryTimelineDrawer: React.FC<HistoryTimelineDrawerProps> = ({
  historyData,
  grounding,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'secrets' | 'visitor' | 'sources'>('timeline');
  const [expandedTimelineYear, setExpandedTimelineYear] = useState<string | null>(null);

  const { timeline, fascinatingSecrets, visitorIntel, historicalContext } = historyData;

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-cyan-500/30 p-4 sm:p-6 shadow-xl flex flex-col gap-6">
      {/* Drawer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md shadow-emerald-500/10">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-slate-100">
                Verified History & Architectural Chronicle
              </h3>
              <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                Gemini 3.5 Flash Search Grounding
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Grounded in current Google Search data and cultural archives
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'timeline'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>

          <button
            onClick={() => setActiveTab('secrets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'secrets'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Secrets ({fascinatingSecrets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('visitor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'visitor'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Visitor Intel</span>
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'sources'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Sources ({grounding.sources.length})</span>
          </button>
        </div>
      </div>

      {/* Historical Context Introduction */}
      {historicalContext && activeTab !== 'sources' && (
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p className="whitespace-pre-line">{historicalContext}</p>
        </div>
      )}

      {/* Tab 1: Chronological Timeline */}
      {activeTab === 'timeline' && (
        <div className="relative pl-6 sm:pl-8 flex flex-col gap-6 before:absolute before:left-2.5 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:via-cyan-500 before:to-purple-500">
          {timeline.map((item, index) => {
            const isExpanded = expandedTimelineYear === item.year;
            return (
              <div key={index} className="relative group">
                {/* Node Bullet */}
                <div className="absolute -left-6 sm:-left-8 top-1 w-5 h-5 rounded-full bg-slate-950 border-2 border-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-125 transition-transform">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>

                {/* Milestone Card */}
                <div
                  onClick={() => setExpandedTimelineYear(isExpanded ? null : item.year)}
                  className="bg-slate-950/80 hover:bg-slate-950 rounded-xl p-3.5 border border-slate-800 hover:border-emerald-500/40 transition cursor-pointer flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tech text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        {item.year}
                      </span>
                      <h4 className="font-display font-semibold text-sm text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {item.event}
                      </h4>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{item.impact}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Fascinating Secrets */}
      {activeTab === 'secrets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fascinatingSecrets.map((secret, i) => (
            <div
              key={i}
              className="bg-slate-950/80 rounded-xl p-4 border border-amber-500/30 shadow-md flex flex-col gap-2 hover:border-amber-400/60 transition group"
            >
              <div className="flex items-center justify-between text-xs font-mono-tech text-amber-400">
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-bold uppercase tracking-wider">
                    SECRET #{i + 1}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 capitalize">
                  {secret.category.replace('_', ' ')}
                </span>
              </div>

              <h4 className="font-display font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                {secret.title}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">{secret.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Visitor Intelligence */}
      {activeTab === 'visitor' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/80 rounded-xl p-4 border border-cyan-500/30 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 font-mono-tech text-xs font-bold uppercase">
              <Building className="w-4 h-4" />
              <span>Current Status</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {visitorIntel.currentStatus || 'Open to public visitors.'}
            </p>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-4 border border-cyan-500/30 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 font-mono-tech text-xs font-bold uppercase">
              <Clock className="w-4 h-4" />
              <span>Best Time to Visit</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {visitorIntel.bestTimeToVisit || 'Golden hour or early morning.'}
            </p>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-4 border border-cyan-500/30 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 font-mono-tech text-xs font-bold uppercase">
              <Lightbulb className="w-4 h-4" />
              <span>Pro Travel Tip</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {visitorIntel.proTravelTip || 'Reserve tickets in advance to skip long entrance queues.'}
            </p>
          </div>
        </div>
      )}

      {/* Tab 4: Search Grounding Sources */}
      {activeTab === 'sources' && (
        <div className="flex flex-col gap-4">
          {grounding.queries && grounding.queries.length > 0 && (
            <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 flex flex-col gap-2">
              <span className="text-xs font-mono-tech text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-cyan-400" />
                <span>Google Search Queries Executed:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {grounding.queries.map((q, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono-tech text-cyan-300"
                  >
                    &ldquo;{q}&rdquo;
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-300">
              Verified Web Citations & Knowledge Links:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {grounding.sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-blue-500/50 text-slate-200 group transition"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                      <Search className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-medium truncate group-hover:text-blue-300 transition-colors">
                      {src.title}
                    </span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
