import React from 'react';
import {
  Award,
  Compass,
  MapPin,
  Volume2,
  BookmarkPlus,
  Eye,
  Check,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { TravelStamp } from '../types.ts';

interface SharedStampBannerProps {
  sharedStamp: TravelStamp & { shareId?: string; sharedAt?: string };
  onExperienceInAR: () => void;
  onSaveToMyJournal: () => void;
  isSavedInJournal: boolean;
  onDismiss: () => void;
}

export const SharedStampBanner: React.FC<SharedStampBannerProps> = ({
  sharedStamp,
  onExperienceInAR,
  onSaveToMyJournal,
  isSavedInJournal,
  onDismiss,
}) => {
  return (
    <div className="w-full bg-gradient-to-r from-amber-950/80 via-slate-900/95 to-cyan-950/80 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-amber-950/40 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Thumbnail & Info */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-950 border border-amber-500/40 shrink-0 shadow-lg">
            <img
              src={sharedStamp.photoUrl}
              alt={sharedStamp.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1 right-1 p-0.5 rounded-full bg-amber-500 text-slate-950">
              <Award className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Shared Discovery</span>
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">•</span>
              <span className="text-xs text-slate-400 hidden sm:inline">
                Stamped on {sharedStamp.timestamp}
              </span>
            </div>

            <h3 className="font-display font-bold text-lg sm:text-xl text-slate-100">
              {sharedStamp.name}
            </h3>

            <p className="text-xs text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {sharedStamp.city}, {sharedStamp.country}
              </span>
              <span>•</span>
              <span className="font-mono-tech text-amber-300/90">{sharedStamp.builtYear}</span>
              <span>•</span>
              <span className="text-slate-400 truncate max-w-[140px] sm:max-w-xs">
                {sharedStamp.architecturalStyle}
              </span>
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={onExperienceInAR}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition transform active:scale-95"
          >
            <Eye className="w-4 h-4" />
            <span>Experience in AR</span>
          </button>

          <button
            onClick={onSaveToMyJournal}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
              isSavedInJournal
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-amber-500/40 hover:border-amber-400'
            }`}
          >
            {isSavedInJournal ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>In Your Passport</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4 text-amber-400" />
                <span>Add to My Passport</span>
              </>
            )}
          </button>

          <button
            onClick={onDismiss}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Dismiss Banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
